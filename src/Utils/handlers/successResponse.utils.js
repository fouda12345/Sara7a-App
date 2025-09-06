const successResponse = ({res , status = 200 , message = "Success" , data}) => {
    res.status(status).json({success : true , message, data})
}

export default successResponse;