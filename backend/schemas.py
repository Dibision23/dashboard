from pydantic import BaseModel
from datetime import date
from typing import Optional

# ==========================================
# 1. ESQUEMAS ORIGINALES (Evitan el error)
# ==========================================
class ItemBase(BaseModel):
    titulo: str
    descripcion: Optional[str] = None

class ItemCreate(ItemBase):
    pass

class ItemResponse(ItemBase):
    id: int

    class Config:
        from_attributes = True # Permite leer datos desde SQLAlchemy

# ==========================================
# 2. NUEVOS ESQUEMAS (Dashboard de Inversiones)
# ==========================================
class PositionCreate(BaseModel):
    ticker: str
    asset_name: str
    purchase_price: float
    quantity: float
    purchase_date: date

class PositionResponse(PositionCreate):
    id: int
    current_price: Optional[float] = None
    daily_change_pct: Optional[float] = None

    class Config:
        from_attributes = True