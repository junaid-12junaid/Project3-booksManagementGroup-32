const userModel=require('../Models/userModel')
const jwt=require('jsonwebtoken')
const {isValid,isVAlidRequestBody,nameRegex,phoneRegex,emailRegex,isValidPassword,validString}=require('../validators/validator')



//Create User================================================>
const createUser = async function (req, res) {
 try {

        const data = req.body
       

        if (!isVAlidRequestBody(data)) {
            return res.status(400).send({ status: false, message: "Please give the Input to Create the User" })
        }

        // extract
        const { title, name, phone, email, password,address} = data

        //validations

        if (!isValid(title)) {
            return res.status(400).send({ status: false, message: 'Title is mandatory and should have non empty String' })
        }

        let titles = ["Mr", "Mrs", "Miss"]

        if(!titles.includes(title)) {
            return res.status(400).send({ status: false, message:`title should be among  ${titles} `})
        } 
 
     if (!isValid(name)) {
            return res.status(400).send({ status: false, message: 'Name is mandatory and should have non empty String' })
        }

        if (!nameRegex.test(name)) {
            return res.status(400).send({ status: false, message: "please provide Valid Name" })
        }

        if (!isValid(phone)) {
            return res.status(400).send({ status: false, message: 'Phone Number is mandatory and should have non empty String' })
        }

        if (!phoneRegex.test(phone)) {
            return res.status(400).send({ status: false, message: "please provide Valid phone Number" })
        }

        const isPhoneAlreadyUsed = await userModel.findOne({phone})
        if (isPhoneAlreadyUsed) {
            return res.status(400).send({ status: false, message: "Phone Number Already Registered" })
        }

      

        if (!isValid(email)) {
            return res.status(400).send({ status: false, message: 'Email is mandatory and should have non empty String' })
        }

        if (!emailRegex.test(email)) {
            return res.status(400).send({ status: false, message: "please provide Valid Email" })
        }

        const isEmailAlreadyUsed = await userModel.findOne({ email })
        if (isEmailAlreadyUsed) {
            return res.status(400).send({ status: false, message: "Email Already Registered" })
        }

        if (!isValid(password)) {
            return res.status(400).send({ status: false, message: 'Password is mandatory and should have non empty String' })
        }
        if(!isValidPassword(password)) { 
            return res.status(400).send({status: false, message: 'please provide Valid password with Min length 8 and Max length 15' })
    }

        if(address){
            if(typeof address!=='object') return res.status(400).send({status:false,message:"the address should be in object"})

            if(!validString(address.street)) return res.status(400).send({status:false,message:"Street should be non empty string"})

            if(!validString(address.city)) return res.status(400).send({status:false,message:"city should be non empty string"})
            
            if(!validString(address.pincode)) return res.status(400).send({status:false,message:"pincode should be non empty string"})

        }
    

        const newUser = await userModel.create(data)
        return res.status(201).send({ status: true, message: 'Succes', data: newUser })

    }
    catch (err) {
        return res.status(500).send({ status: false, error: err.message });
    }
};



//Login User===========================================>
const uesrLogin = async function (req, res){
    try {
        let data=req.body
        let{email,password}=data

        if(!isVAlidRequestBody(data)) 
        return res.status(400).send({status:false,message:"the input is requried to Login"})

        if (!isValid(email)) {
            return res.status(400).send({ status: false, message: 'Email should be non empty string' })
        }

        if (!isValid(password)) {
            return res.status(400).send({ status: false, message: 'password should be non empty string' })
        }

        let gettingDetails = await userModel.findOne({ email: email, password: password });
        if (!gettingDetails) {
            return res.status(401).send({ status: false, message: "Invalid Login Credentials" });
        }

        // token create :-
        let token = await jwt.sign(
            {
                userId: gettingDetails._id,
                Batch: "Plutonium",
                Project: "Group32",
            },
            "secret-key-Group32",{expiresIn: '10h'}
        );
        res.header('x-api-key', token)

        res.status(200).send({ status: true, message:'Success',data:token });
    } catch (err) {
        res.status(500).send({ status: false, error: err.message });
    }
};


module.exports= {createUser,uesrLogin}