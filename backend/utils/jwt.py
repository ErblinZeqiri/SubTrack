import jwt
from datetime import datetime, timedelta

SECRET_KEY = "super_secret"
ALGORITHM = "HS256"

def create_token(user_uid: str, days=7) -> str:
  """
  Function that issues a JWT token for a user

  Args:
    user_uid (str): The uid of the user
    days (int, optional): The number of days the token will be valid. Defaults to 7

  Returns:
    str: The JWT token as string
  """
  payload = {
    "sub": user_uid,
    "iat": datetime.now().timestamp(),
    "exp": (datetime.now() + timedelta(days=int(days))).timestamp()
  }
  return jwt.encode(payload, SECRET_KEY, algorithm=ALGORITHM)

def decode_token(token: str) -> str:
  """
  Function that decodes a JWT token and returns the user uid

  Args:
    token (str): The JWT token to decode

  Returns:
    str: The user uid stored inside the "sub" key of the payload
  """
  try:
    payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
    return payload["sub"]
  except jwt.ExpiredSignatureError:
    raise Exception("Token Expired")
  except jwt.InvalidSignatureError:
    raise Exception("Invalid Token")
  