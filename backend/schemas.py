from pydantic import BaseModel, ConfigDict, computed_field, field_validator
from typing import List, Optional
from datetime import date as DateType, datetime, timezone
import os
from dotenv import load_dotenv

load_dotenv()

API_BASE_URL = os.getenv("API_BASE_URL", "https://api.canaanglobalinternational.com")

class Token(BaseModel):
    access_token: str
    token_type: str

class CredentialsUpdate(BaseModel):
    current_password: str
    new_username: Optional[str] = None
    new_password: Optional[str] = None

class BulkDeleteRequest(BaseModel):
    ids: List[int]

class AchievementBase(BaseModel):
    title: str
    description: str

class AchievementCreate(AchievementBase):
    pass

class Achievement(AchievementBase):
    id: int
    model_config = ConfigDict(from_attributes=True)

    @computed_field
    @property
    def image_url(self) -> str:
        return f"{API_BASE_URL}/api/achievements/{self.id}/image"

class CircularBase(BaseModel):
    title: str
    description: str
    circular_name: Optional[str] = None
    date: Optional[DateType] = None

class CircularCreate(CircularBase):
    pass

class Circular(CircularBase):
    id: int
    model_config = ConfigDict(from_attributes=True)

    @computed_field
    @property
    def pdf_url(self) -> str:
        return f"{API_BASE_URL}/api/circulars/{self.id}/pdf"

class TeamMemberBase(BaseModel):
    name: str
    designation: str
    email: str
    rank: int = 0

class TeamMemberCreate(TeamMemberBase):
    pass

class TeamMember(TeamMemberBase):
    id: int
    model_config = ConfigDict(from_attributes=True)

    @computed_field
    @property
    def image_url(self) -> str:
        return f"{API_BASE_URL}/api/teams/{self.id}/image"

class CargoImageBase(BaseModel):
    pass

class CargoImage(CargoImageBase):
    id: int
    category_id: int
    model_config = ConfigDict(from_attributes=True)
    
    @computed_field
    @property
    def image_url(self) -> str:
        return f"{API_BASE_URL}/api/cargos/images/{self.id}/content"

class CargoCategoryBase(BaseModel):
    name: str

class CargoCategoryCreate(CargoCategoryBase):
    pass

class CargoCategory(CargoCategoryBase):
    id: int
    images: List[CargoImage] = []
    model_config = ConfigDict(from_attributes=True)

class ServiceBase(BaseModel):
    title: str
    description: str

class ServiceCreate(ServiceBase):
    pass

class Service(ServiceBase):
    id: int
    model_config = ConfigDict(from_attributes=True)
    
    @computed_field
    @property
    def image_url(self) -> str:
        return f"{API_BASE_URL}/api/services/{self.id}/image"

class LicenseBase(BaseModel):
    title: str
    description: str

class LicenseCreate(LicenseBase):
    pass

class License(LicenseBase):
    id: int
    model_config = ConfigDict(from_attributes=True)
    
    @computed_field
    @property
    def image_url(self) -> str:
        return f"{API_BASE_URL}/api/licenses/{self.id}/image"

class BranchBase(BaseModel):
    title: str
    address: str
    map_link: str

class BranchCreate(BranchBase):
    pass

class Branch(BranchBase):
    id: int
    model_config = ConfigDict(from_attributes=True)
    
    @computed_field
    @property
    def image_url(self) -> str:
        return f"{API_BASE_URL}/api/branches/{self.id}/image"

class CustomsExchangeRateBase(BaseModel):
    usd: Optional[str] = None
    aed: Optional[str] = None
    gbp: Optional[str] = None
    eur: Optional[str] = None

class CustomsExchangeRateCreate(CustomsExchangeRateBase):
    pass

class CustomsExchangeRate(CustomsExchangeRateBase):
    id: int
    model_config = ConfigDict(from_attributes=True)

class FleetBase(BaseModel):
    title: str
    description: str

class FleetCreate(FleetBase):
    pass

class Fleet(FleetBase):
    id: int
    model_config = ConfigDict(from_attributes=True)
    
    @computed_field
    @property
    def image_url(self) -> str:
        return f"{API_BASE_URL}/api/fleets/{self.id}/image"

class OwnerImageBase(BaseModel):
    pass

class OwnerImageCreate(OwnerImageBase):
    pass

class OwnerImage(OwnerImageBase):
    id: int
    model_config = ConfigDict(from_attributes=True)

    @computed_field
    @property
    def image_url(self) -> str:
        return f"{API_BASE_URL}/api/owner-image/content"

class HeroVideoBase(BaseModel):
    pass

class HeroVideoCreate(HeroVideoBase):
    pass

class HeroVideo(HeroVideoBase):
    id: int
    model_config = ConfigDict(from_attributes=True)

    @computed_field
    @property
    def video_url(self) -> str:
        return f"{API_BASE_URL}/api/hero-video/content"

class ContactMessageBase(BaseModel):
    inquiry_type: str
    name: str
    email: str
    phone: Optional[str] = None
    message: Optional[str] = None
    company_name: Optional[str] = None
    shipping_mode: Optional[str] = None
    port_of_loading: Optional[str] = None
    port_of_discharge: Optional[str] = None
    container_type: Optional[str] = None
    weight: Optional[str] = None
    factory_location: Optional[str] = None
    transport_export_import: Optional[str] = None
    pickup_location: Optional[str] = None
    delivery_location: Optional[str] = None
    transport_cargo_type: Optional[str] = None
    quantity: Optional[str] = None
    rfid_org_name: Optional[str] = None

class ContactMessageCreate(ContactMessageBase):
    pass

class ContactMessage(ContactMessageBase):
    id: int
    is_read: bool
    created_at: datetime
    model_config = ConfigDict(from_attributes=True)

    @field_validator("created_at")
    @classmethod
    def ensure_utc(cls, v: datetime) -> datetime:
        # Stored as a naive UTC timestamp; attach tzinfo so JSON serialization
        # includes an explicit offset, otherwise browsers misread it as local time.
        return v if v.tzinfo else v.replace(tzinfo=timezone.utc)
