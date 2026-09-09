from typing import List
from fastapi import FastAPI, Depends, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
import yfinance as yf


import models
import schemas
from database import engine, get_db

# Crea las tablas automáticamente al levantar la app
models.Base.metadata.create_all(bind=engine)

app = FastAPI(title="Mi WebApp API")

# CORS: Permite peticiones desde localhost y desde el futuro dominio de Vercel
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/api/ticker/{ticker_symbol}")
def validate_ticker(ticker_symbol: str):
    ticker = yf.Ticker(ticker_symbol)
    info = ticker.info
    
    # Si no tiene nombre corto, asumimos que el ticker es inválido
    if "shortName" not in info:
        raise HTTPException(status_code=404, detail="Instrumento no encontrado")
        
    return {
        "ticker": ticker_symbol,
        "name": info.get("shortName"),
        "current_price": info.get("currentPrice")
    }

@app.get("/api/portfolio")
def get_portfolio(db: Session = Depends(get_db)):
    positions = db.query(models.Position).all()
    portfolio_data = []
    
    for pos in positions:
        ticker = yf.Ticker(pos.ticker)
        try:
            current_price = ticker.fast_info['lastPrice']
            prev_close = ticker.fast_info['regularMarketPreviousClose']
            
            # Cálculo de la variación diaria
            daily_change_pct = ((current_price - prev_close) / prev_close) * 100
            
        except Exception:
            current_price = None
            daily_change_pct = None

        portfolio_data.append({
            "id": pos.id,
            "ticker": pos.ticker,
            "asset_name": pos.asset_name,
            "purchase_price": pos.purchase_price,
            "quantity": pos.quantity,
            "current_price": current_price,
            "daily_change_pct": round(daily_change_pct, 2) if daily_change_pct else None
        })
        
    return portfolio_data

@app.post("/api/portfolio", response_model=schemas.PositionResponse)
def add_position(position: schemas.PositionCreate, db: Session = Depends(get_db)):
    # Creamos la instancia del modelo SQLAlchemy
    new_position = models.Position(
        ticker=position.ticker,
        asset_name=position.asset_name,
        purchase_price=position.purchase_price,
        quantity=position.quantity,
        purchase_date=position.purchase_date
    )
    
    # Guardamos en la base de datos Neon.tech
    db.add(new_position)
    db.commit()
    db.refresh(new_position)
    
    return new_position

@app.delete("/api/portfolio/{position_id}")
def delete_position(position_id: int, db: Session = Depends(get_db)):
    # Buscamos el registro en la base de datos
    position = db.query(models.Position).filter(models.Position.id == position_id).first()
    
    # Si no existe, devolvemos un error 404
    if not position:
        raise HTTPException(status_code=404, detail="Instrumento no encontrado")
    
    # Eliminamos y guardamos los cambios
    db.delete(position)
    db.commit()
    
    return {"message": "Instrumento eliminado correctamente"}

@app.get("/api/health")
def health_check():
    return {"status": "ok", "message": "Backend operativo"}

@app.get("/api/items", response_model=List[schemas.ItemResponse])
def get_items(db: Session = Depends(get_db)):
    return db.query(models.Item).all()

@app.post("/api/items", response_model=schemas.ItemResponse, status_code=201)
def create_item(item: schemas.ItemCreate, db: Session = Depends(get_db)):
    db_item = models.Item(titulo=item.titulo, descripcion=item.descripcion)
    db.add(db_item)
    db.commit()
    db.refresh(db_item)
    return db_item