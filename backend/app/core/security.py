from typing import Any

import jwt
from fastapi import Depends, HTTPException
from fastapi.security import OAuth2PasswordBearer

from app.core.config import settings

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="token")


async def verify_supabase_jwt(token: str) -> dict[str, Any]:
    # TODO: upgrade to RS256/JWKS for production-grade verification
    try:
        payload: dict[str, Any] = jwt.decode(
            token,
            settings.SUPABASE_JWT_SECRET,
            algorithms=["HS256"],
            audience="authenticated",
        )
        return payload
    except jwt.InvalidTokenError as exc:
        raise HTTPException(status_code=401, detail="invalid_token") from exc


async def get_current_user(
    token: str = Depends(oauth2_scheme),
) -> str:
    payload = await verify_supabase_jwt(token)
    user_id: str | None = payload.get("sub")
    if not user_id:
        raise HTTPException(status_code=401, detail="invalid_token")
    return user_id
