import Users from "../model/users.js"

export const checkRole = (roles) => {
  return async(req, res, next) => {
  try {
    const user = await Users.findById(req.userId)
    if(!user){
      return res.status(401).json({
        message: 'Not authorized'
      })
    }
    if (roles.indexOf(user.role) > -1) next();
    else return res.status(401).json({
      message: 'Not authorized'
    });

  } catch (error) {
    return res.status(500).json({
      err: error.message
    })
  }
  
}
}