class User:
  def __init__(self, 
    uid: str = "", 
    email:str = "", 
    fullName:str = "", 
    password:str = "", 
    salt:str = "",
    *args, **kwargs
  ) -> None:
    self.uid = uid
    self.email = email
    self.fullName = fullName
    self.password = password
    self.salt = salt

  def __repr__(self) -> str:
    return f"User({self.email}, {self.uid})"

  def __str__(self) -> str:
    return self.__repr__