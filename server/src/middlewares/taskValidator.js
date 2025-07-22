import Joi from 'joi';

export const validateTaskAssignment = (data) => {
  const schema = Joi.object({
    userId: Joi.string().uuid().required(),
    taskCount: Joi.number().integer().min(1).max(100).required(),
    totalProfit: Joi.number().positive().required(),
    forcedTasks: Joi.array().items(
      Joi.object({
        taskNumber: Joi.number().integer().positive().required(),
        depositAmount: Joi.number().positive().required(),
        customProfit: Joi.number().positive()
      })
    ).optional()
  });

  return schema.validate(data);
};
