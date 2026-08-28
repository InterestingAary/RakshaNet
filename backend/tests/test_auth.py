import unittest
from datetime import datetime, timedelta, timezone
from types import SimpleNamespace
from uuid import uuid4

from fastapi import HTTPException
from jose import jwt

from app.api.v1.auth import (
    get_current_user,
    login,
    me,
    register,
    require_authority,
    require_citizen,
)
from app.core.config import settings
from app.core.security import create_access_token, hash_password, verify_password
from app.models.user import ROLE_AUTHORITY, ROLE_CITIZEN, User
from app.schemas.user import UserCreate, UserResponse


class FakeSession:
    def __init__(self, user=None):
        self.user = user
        self.added_user = None
        self.committed = False

    def scalar(self, _statement):
        return self.user

    def add(self, user):
        self.added_user = user
        self.user = user

    def commit(self):
        self.committed = True

    def refresh(self, user):
        user.id = user.id or uuid4()
        user.is_active = True
        user.created_at = datetime.now(timezone.utc)
        user.updated_at = datetime.now(timezone.utc)

    def get(self, _model, user_id):
        return self.user if self.user and self.user.id == user_id else None


class AuthTests(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.original_secret = settings.jwt_secret_key
        settings.jwt_secret_key = "test-only-secret"

    @classmethod
    def tearDownClass(cls):
        settings.jwt_secret_key = cls.original_secret

    def make_user(self, role=ROLE_CITIZEN, active=True):
        return User(
            id=uuid4(),
            full_name="Test User",
            email="test@example.com",
            phone=None,
            hashed_password=hash_password("password123"),
            role=role,
            is_active=active,
            created_at=datetime.now(timezone.utc),
            updated_at=datetime.now(timezone.utc),
        )

    def test_register_hashes_password_and_defaults_to_citizen(self):
        data = UserCreate(
            full_name="New User",
            email="NEW@example.com",
            password="password123",
        )
        user = register(data, FakeSession())

        self.assertEqual(user.role, ROLE_CITIZEN)
        self.assertNotEqual(user.hashed_password, "password123")
        self.assertTrue(verify_password("password123", user.hashed_password))
        self.assertNotIn("hashed_password", UserResponse.model_validate(user).model_dump())

    def test_duplicate_email_registration_is_rejected(self):
        existing = self.make_user()
        data = UserCreate(
            full_name="Duplicate",
            email="test@example.com",
            password="password123",
        )

        with self.assertRaises(HTTPException) as error:
            register(data, FakeSession(existing))

        self.assertEqual(error.exception.status_code, 409)

    def test_successful_login_returns_bearer_token(self):
        user = self.make_user()
        form = SimpleNamespace(username=user.email, password="password123")

        result = login(form, FakeSession(user))

        self.assertEqual(result["token_type"], "bearer")
        self.assertEqual(get_current_user(result["access_token"], FakeSession(user)), user)

    def test_invalid_login_is_rejected_without_detail(self):
        user = self.make_user()
        form = SimpleNamespace(username=user.email, password="wrong-password")

        with self.assertRaises(HTTPException) as error:
            login(form, FakeSession(user))

        self.assertEqual(error.exception.status_code, 401)
        self.assertEqual(error.exception.detail, "Invalid email or password")

    def test_valid_and_invalid_jwt_authentication(self):
        user = self.make_user()
        token = create_access_token(user.id)

        self.assertEqual(get_current_user(token, FakeSession(user)), user)
        with self.assertRaises(HTTPException) as error:
            get_current_user("not-a-token", FakeSession(user))
        self.assertEqual(error.exception.status_code, 401)

    def test_expired_jwt_is_rejected(self):
        user = self.make_user()
        token = jwt.encode(
            {"sub": str(user.id), "exp": datetime.now(timezone.utc) - timedelta(minutes=1)},
            settings.jwt_secret_key,
            algorithm=settings.jwt_algorithm,
        )

        with self.assertRaises(HTTPException) as error:
            get_current_user(token, FakeSession(user))
        self.assertEqual(error.exception.status_code, 401)

    def test_inactive_user_is_rejected(self):
        user = self.make_user(active=False)

        with self.assertRaises(HTTPException) as error:
            get_current_user(create_access_token(user.id), FakeSession(user))
        self.assertEqual(error.exception.status_code, 401)

    def test_me_returns_safe_current_user(self):
        user = self.make_user()
        result = me(user)

        self.assertEqual(result, user)
        self.assertNotIn("hashed_password", UserResponse.model_validate(result).model_dump())

    def test_role_authorization(self):
        citizen = self.make_user(ROLE_CITIZEN)
        authority = self.make_user(ROLE_AUTHORITY)

        self.assertIs(require_citizen(citizen), citizen)
        self.assertIs(require_authority(authority), authority)
        with self.assertRaisesRegex(HTTPException, "Citizen role required"):
            require_citizen(authority)
        with self.assertRaisesRegex(HTTPException, "Authority role required"):
            require_authority(citizen)


if __name__ == "__main__":
    unittest.main()
