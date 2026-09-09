from sqlalchemy import Column, Integer, String, Float, Date
from database import Base

class Position(Base):
    __tablename__ = "positions"
    id = Column(Integer, primary_key=True, index=True)
    ticker = Column(String, index=True) # Ej: AAPL, VWCE.DE
    asset_name = Column(String)
    purchase_price = Column(Float)
    quantity = Column(Float)
    purchase_date = Column(Date)