from typing import List
from fastapi import FastAPI, Depends, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session

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