from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Form, status
from sqlalchemy.orm import Session
from typing import List, Dict, Any, Optional
from app import crud, schemas, database, models
from app.services.nvidia_service import NvidiaService
import logging

logger = logging.getLogger("uvicorn")
router = APIRouter(prefix="/statement", tags=["Bank Statements"])

import datetime

@router.post("/upload", response_model=schemas.Statement)
async def upload_statement(
    file: UploadFile = File(...), 
    password: Optional[str] = Form(None)
):
    try:
        # Read file contents
        contents = await file.read()
        filename = file.filename or "statement.pdf"
        content_type = file.content_type or "application/pdf"
        
        logger.info(f"Parsing statement file: {filename} ({content_type}, size={len(contents)} bytes)")
 
        # Check PDF password requirement
        if filename.lower().endswith('.pdf'):
            import io
            from pypdf import PdfReader
            
            try:
                pdf_file = io.BytesIO(contents)
                reader = PdfReader(pdf_file)
                if reader.is_encrypted:
                    if not password:
                        logger.warning(f"PDF is encrypted: {filename}. Password required.")
                        raise HTTPException(
                            status_code=status.HTTP_401_UNAUTHORIZED,
                            detail="PASSWORD_REQUIRED"
                        )
                    # Attempt decryption
                    try:
                        success = reader.decrypt(password)
                    except Exception as dec_err:
                        logger.error(f"Decryption failed error: {str(dec_err)}")
                        success = 0
                        
                    if not success:
                        logger.warning(f"Invalid PDF password provided for {filename}.")
                        raise HTTPException(
                            status_code=status.HTTP_401_UNAUTHORIZED,
                            detail="INVALID_PASSWORD"
                        )
                    logger.info("PDF successfully decrypted using provided password.")
            except HTTPException:
                raise
            except Exception as e:
                logger.error(f"Error checking PDF encryption: {str(e)}")
 
        # Call NVIDIA NIM parser to extract and structure
        parse_result = NvidiaService.parse_statement(contents, filename, content_type, password=password)
        
        bank_name = parse_result.get("bank_name", "Unknown Bank")
        period = parse_result.get("statement_period", "Unknown Period")
        parsed_txs = parse_result.get("transactions", [])
        
        # Calculate stats
        total_transactions = len(parsed_txs)
        total_debits = sum(t.get("amount", 0.0) for t in parsed_txs if t.get("type") == "debit")
        total_credits = sum(t.get("amount", 0.0) for t in parsed_txs if t.get("type") == "credit")
        
        # Create unique ID for statement (temporary client-side ID)
        statement_id = int(datetime.datetime.now().timestamp() * 1000)
        
        # Format transaction list
        tx_list = []
        for idx, tx in enumerate(parsed_txs):
            tx_list.append(schemas.Transaction(
                id=statement_id + idx,
                date=tx.get("date", "2026-06-01"),
                raw_description=tx.get("raw_description", "Unknown"),
                merchant=tx.get("merchant", "Unknown Merchant"),
                amount=tx.get("amount", 0.0),
                type=tx.get("type", "debit"),
                category=tx.get("category", "Other Expenses"),
                payment_method=tx.get("payment_method", "Other"),
                is_recurring=tx.get("is_recurring", False),
                statement_id=statement_id,
                created_at=datetime.datetime.now()
            ))
            
        statement_response = schemas.Statement(
            id=statement_id,
            filename=filename,
            bank_name=bank_name,
            period=period,
            total_transactions=total_transactions,
            total_debits=total_debits,
            total_credits=total_credits,
            uploaded_at=datetime.datetime.now(),
            transactions=tx_list
        )
        
        return statement_response
 
    except Exception as e:
        logger.error(f"Failed to process uploaded statement: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error parsing statement: {str(e)}"
        )
 
@router.get("/", response_model=List[schemas.Statement])
def list_statements():
    return []
 
@router.delete("/{statement_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_statement(statement_id: int):
    return None
