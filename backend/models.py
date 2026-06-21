from sqlalchemy import Column, Integer, String, Text, LargeBinary, ForeignKey, Date
from sqlalchemy.orm import relationship
from database import Base

class AdminUser(Base):
    __tablename__ = "admin_users"

    id = Column(Integer, primary_key=True, index=True)
    username = Column(String, unique=True, index=True)
    hashed_password = Column(String)

class Achievement(Base):
    __tablename__ = "achievements"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String, index=True)
    description = Column(Text)
    image_blob = Column(LargeBinary)

class Circular(Base):
    __tablename__ = "circulars"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String, index=True)
    description = Column(Text)
    circular_name = Column(String, nullable=True)
    date = Column(Date, nullable=True)
    pdf_blob = Column(LargeBinary)

class TeamMember(Base):
    __tablename__ = "team_members"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, index=True)
    designation = Column(String)
    email = Column(String, index=True)
    image_blob = Column(LargeBinary)
    rank = Column(Integer, default=0)

class CargoCategory(Base):
    __tablename__ = "cargo_categories"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, unique=True, index=True)

    images = relationship("CargoImage", back_populates="category", cascade="all, delete-orphan")

class CargoImage(Base):
    __tablename__ = "cargo_images"

    id = Column(Integer, primary_key=True, index=True)
    category_id = Column(Integer, ForeignKey("cargo_categories.id", ondelete="CASCADE"))
    image_blob = Column(LargeBinary)

    category = relationship("CargoCategory", back_populates="images")

class Service(Base):
    __tablename__ = "services"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String, index=True)
    description = Column(Text)
    image_blob = Column(LargeBinary)

class License(Base):
    __tablename__ = "licenses"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String, index=True)
    description = Column(Text)
    image_blob = Column(LargeBinary)

class Branch(Base):
    __tablename__ = "branches"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String, index=True)
    address = Column(Text)
    map_link = Column(Text)
    image_blob = Column(LargeBinary)

class CustomsExchangeRate(Base):
    __tablename__ = "customs_exchange_rates"

    id = Column(Integer, primary_key=True, index=True)
    usd = Column(String)
    aed = Column(String)
    gbp = Column(String)
    eur = Column(String)

class Fleet(Base):
    __tablename__ = "fleets"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String, index=True)
    description = Column(Text)
    image_blob = Column(LargeBinary)

class OwnerImage(Base):
    __tablename__ = "owner_images"

    id = Column(Integer, primary_key=True, index=True)
    image_blob = Column(LargeBinary)

class HeroVideo(Base):
    __tablename__ = "hero_videos"

    id = Column(Integer, primary_key=True, index=True)
    video_blob = Column(LargeBinary)
