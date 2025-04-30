import Joi from 'joi';

export const hashtagQuerySchema = Joi.object({
    limit: Joi.number().min(1).max(100).default(10),
    offset: Joi.number().min(0).default(0)
}).unknown(true);  // Allow unknown parameters since tag is in URL params, not query
