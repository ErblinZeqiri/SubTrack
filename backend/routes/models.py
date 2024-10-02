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
  
class Subscription:
  def __init__(self, 
    id: str = "", 
    companyName:str = "", 
    nextPaymentDate:str = "",
    amount:int = 0,
    category:str = "",
    renewal:str = "",
    paymentHistory = {},
    deadline:str = "",
    domain:str = "",
    logo:str = "",
    user_uid:str = "",
    *args, **kwargs
  ) -> None:
    self.id = id
    self.companyName = companyName
    self.nextPaymentDate = nextPaymentDate
    self.amount = amount
    self.category = category
    self.renewal = renewal
    self.paymentHistory = paymentHistory
    self.deadline = deadline
    self.domain = domain
    self.logo = logo
    self.user_uid = user_uid

  def __repr__(self) -> str:
    return f"Subscription({self.companyName}, {self.id})"

  def __str__(self) -> str:
    return self.__repr__
    