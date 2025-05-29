import { Router } from 'express';
import {query, validationResult, body, matchedData, checkSchema} from'express-validator';
import { User } from '../mongoose/schemas/user.mjs';
import { hashPassword } from '../utils/helpers.mjs';
import { createUserValidationSchema } from '../utils/validationSchemas.mjs';

const router = Router();

//Create user
router.post('/api/users', checkSchema(createUserValidationSchema), async (request, response) => {
    const {body} = request;    
    const result = validationResult(request);
    if(!result.isEmpty())
        return response.status(400).send(result.array());
    const data = matchedData(request);
    console.log(data); 
    data.password = await hashPassword(data.password);
    console.log(data); 
    const newUser = new User(data);
    try{
        const savedUser = await newUser.save();
        return response.status(201).send(savedUser);
    }catch(err){
        console.log(err);
        return response.status(500);
    }
});