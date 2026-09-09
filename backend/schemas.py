from pydantic import BaseModel
from typing import Optional

class ItemBase(BaseModel):
    titulo: str
    descripcion: Optional[str] = None

class ItemCreate(ItemBase):
    pass

class ItemResponse(ItemBase):
    id: int

    class Config:
        from_attributes = True