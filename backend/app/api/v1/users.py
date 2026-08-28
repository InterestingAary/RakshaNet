from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.api.v1.auth import get_current_user, require_authority
from app.core.database import get_db
from app.core.security import hash_password
from app.models.user import User
from app.schemas.user import UserResponse, UserUpdate

router = APIRouter(prefix="/users", tags=["users"])


@router.patch("/me", response_model=UserResponse)
def update_me(
    user_data: UserUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> User:
    for field, value in user_data.model_dump(exclude_unset=True, exclude={"password"}).items():
        setattr(current_user, field, value)
    if user_data.password is not None:
        current_user.hashed_password = hash_password(user_data.password.get_secret_value())
    db.commit()
    db.refresh(current_user)
    return current_user


@router.get("", response_model=list[UserResponse])
def list_users(
    _authority: User = Depends(require_authority),
    db: Session = Depends(get_db),
) -> list[User]:
    return list(db.scalars(select(User).order_by(User.created_at)).all())


@router.get("/{user_id}", response_model=UserResponse)
def get_user(
    user_id: UUID,
    _authority: User = Depends(require_authority),
    db: Session = Depends(get_db),
) -> User:
    user = db.get(User, user_id)
    if user is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found",
        )
    return user