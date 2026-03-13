import { z } from 'zod';
import { JsonValue, InputJsonValue, objectEnumValues } from '@prisma/client/runtime/library';
import type { Prisma } from '../prisma/client';

/////////////////////////////////////////
// HELPER FUNCTIONS
/////////////////////////////////////////

// JSON
//------------------------------------------------------

export type NullableJsonInput = JsonValue | null | 'JsonNull' | 'DbNull' | typeof objectEnumValues.instances.DbNull | typeof objectEnumValues.instances.JsonNull;

export const transformJsonNull = (v?: NullableJsonInput) => {
  if (!v || v === 'DbNull') return typeof objectEnumValues.instances.DbNull;
  if (v === 'JsonNull') return typeof objectEnumValues.instances.JsonNull;
  return v;
};

export const JsonValueSchema: z.ZodType<JsonValue> = z.lazy(() =>
  z.union([
    z.string(),
    z.number(),
    z.boolean(),
    z.literal(null),
    z.record(z.string(), z.lazy(() => JsonValueSchema.optional())),
    z.array(z.lazy(() => JsonValueSchema)),
  ])
);

export type JsonValueType = z.infer<typeof JsonValueSchema>;

export const NullableJsonValue = z
  .union([JsonValueSchema, z.literal('DbNull'), z.literal('JsonNull')])
  .nullable()
  .transform((v) => transformJsonNull(v));

export type NullableJsonValueType = z.infer<typeof NullableJsonValue>;

export const InputJsonValueSchema: z.ZodType<InputJsonValue> = z.lazy(() =>
  z.union([
    z.string(),
    z.number(),
    z.boolean(),
    z.object({ toJSON: z.any() }),
    z.record(z.string(), z.lazy(() => z.union([InputJsonValueSchema, z.literal(null)]))),
    z.array(z.lazy(() => z.union([InputJsonValueSchema, z.literal(null)]))),
  ])
);

export type InputJsonValueType = z.infer<typeof InputJsonValueSchema>;


/////////////////////////////////////////
// ENUMS
/////////////////////////////////////////

export const TransactionIsolationLevelSchema = z.enum(['ReadUncommitted','ReadCommitted','RepeatableRead','Serializable']);

export const CourseScalarFieldEnumSchema = z.enum(['id','userId','name','rubric','createdAt','updatedAt']);

export const TaskScalarFieldEnumSchema = z.enum(['id','userId','title','description','importance','weight','deadline','position','type','isCompleted','estimatedPomodoros','courseId','parentId','createdAt','updatedAt']);

export const AttachmentScalarFieldEnumSchema = z.enum(['id','taskId','name','url','type','createdAt']);

export const SortOrderSchema = z.enum(['asc','desc']);

export const NullableJsonNullValueInputSchema: z.ZodType<Prisma.NullableJsonNullValueInput> = z.enum(['DbNull','JsonNull',]).transform((value) => value === 'JsonNull' ? objectEnumValues.instances.JsonNull : value === 'DbNull' ? objectEnumValues.instances.DbNull : value);

export const QueryModeSchema = z.enum(['default','insensitive']);

export const JsonNullValueFilterSchema: z.ZodType<Prisma.JsonNullValueFilter> = z.enum(['DbNull','JsonNull','AnyNull',]).transform((value) => value === 'JsonNull' ? objectEnumValues.instances.JsonNull : value === 'DbNull' ? objectEnumValues.instances.DbNull : value === 'AnyNull' ? objectEnumValues.instances.AnyNull : value);

export const NullsOrderSchema = z.enum(['first','last']);
/////////////////////////////////////////
// MODELS
/////////////////////////////////////////

/////////////////////////////////////////
// COURSE SCHEMA
/////////////////////////////////////////

export const CourseSchema = z.object({
  id: z.uuid(),
  userId: z.string(),
  name: z.string(),
  rubric: JsonValueSchema.nullable(),
  createdAt: z.coerce.date(),
  updatedAt: z.coerce.date(),
})

export type Course = z.infer<typeof CourseSchema>

/////////////////////////////////////////
// TASK SCHEMA
/////////////////////////////////////////

export const TaskSchema = z.object({
  id: z.uuid(),
  userId: z.string(),
  title: z.string(),
  description: z.string().nullable(),
  importance: z.number().int(),
  weight: z.number().int(),
  deadline: z.coerce.date().nullable(),
  position: z.number().int(),
  type: z.string(),
  isCompleted: z.boolean(),
  estimatedPomodoros: z.number().int(),
  courseId: z.string().nullable(),
  parentId: z.string().nullable(),
  createdAt: z.coerce.date(),
  updatedAt: z.coerce.date(),
})

export type Task = z.infer<typeof TaskSchema>

/////////////////////////////////////////
// ATTACHMENT SCHEMA
/////////////////////////////////////////

export const AttachmentSchema = z.object({
  id: z.uuid(),
  taskId: z.string(),
  name: z.string(),
  url: z.string(),
  type: z.string(),
  createdAt: z.coerce.date(),
})

export type Attachment = z.infer<typeof AttachmentSchema>

/////////////////////////////////////////
// SELECT & INCLUDE
/////////////////////////////////////////

// COURSE
//------------------------------------------------------

export const CourseIncludeSchema: z.ZodType<Prisma.CourseInclude> = z.object({
  tasks: z.union([z.boolean(),z.lazy(() => TaskFindManyArgsSchema)]).optional(),
  _count: z.union([z.boolean(),z.lazy(() => CourseCountOutputTypeArgsSchema)]).optional(),
}).strict();

export const CourseArgsSchema: z.ZodType<Prisma.CourseDefaultArgs> = z.object({
  select: z.lazy(() => CourseSelectSchema).optional(),
  include: z.lazy(() => CourseIncludeSchema).optional(),
}).strict();

export const CourseCountOutputTypeArgsSchema: z.ZodType<Prisma.CourseCountOutputTypeDefaultArgs> = z.object({
  select: z.lazy(() => CourseCountOutputTypeSelectSchema).nullish(),
}).strict();

export const CourseCountOutputTypeSelectSchema: z.ZodType<Prisma.CourseCountOutputTypeSelect> = z.object({
  tasks: z.boolean().optional(),
}).strict();

export const CourseSelectSchema: z.ZodType<Prisma.CourseSelect> = z.object({
  id: z.boolean().optional(),
  userId: z.boolean().optional(),
  name: z.boolean().optional(),
  rubric: z.boolean().optional(),
  createdAt: z.boolean().optional(),
  updatedAt: z.boolean().optional(),
  tasks: z.union([z.boolean(),z.lazy(() => TaskFindManyArgsSchema)]).optional(),
  _count: z.union([z.boolean(),z.lazy(() => CourseCountOutputTypeArgsSchema)]).optional(),
}).strict()

// TASK
//------------------------------------------------------

export const TaskIncludeSchema: z.ZodType<Prisma.TaskInclude> = z.object({
  course: z.union([z.boolean(),z.lazy(() => CourseArgsSchema)]).optional(),
  parent: z.union([z.boolean(),z.lazy(() => TaskArgsSchema)]).optional(),
  children: z.union([z.boolean(),z.lazy(() => TaskFindManyArgsSchema)]).optional(),
  attachments: z.union([z.boolean(),z.lazy(() => AttachmentFindManyArgsSchema)]).optional(),
  _count: z.union([z.boolean(),z.lazy(() => TaskCountOutputTypeArgsSchema)]).optional(),
}).strict();

export const TaskArgsSchema: z.ZodType<Prisma.TaskDefaultArgs> = z.object({
  select: z.lazy(() => TaskSelectSchema).optional(),
  include: z.lazy(() => TaskIncludeSchema).optional(),
}).strict();

export const TaskCountOutputTypeArgsSchema: z.ZodType<Prisma.TaskCountOutputTypeDefaultArgs> = z.object({
  select: z.lazy(() => TaskCountOutputTypeSelectSchema).nullish(),
}).strict();

export const TaskCountOutputTypeSelectSchema: z.ZodType<Prisma.TaskCountOutputTypeSelect> = z.object({
  children: z.boolean().optional(),
  attachments: z.boolean().optional(),
}).strict();

export const TaskSelectSchema: z.ZodType<Prisma.TaskSelect> = z.object({
  id: z.boolean().optional(),
  userId: z.boolean().optional(),
  title: z.boolean().optional(),
  description: z.boolean().optional(),
  importance: z.boolean().optional(),
  weight: z.boolean().optional(),
  deadline: z.boolean().optional(),
  position: z.boolean().optional(),
  type: z.boolean().optional(),
  isCompleted: z.boolean().optional(),
  estimatedPomodoros: z.boolean().optional(),
  courseId: z.boolean().optional(),
  parentId: z.boolean().optional(),
  createdAt: z.boolean().optional(),
  updatedAt: z.boolean().optional(),
  course: z.union([z.boolean(),z.lazy(() => CourseArgsSchema)]).optional(),
  parent: z.union([z.boolean(),z.lazy(() => TaskArgsSchema)]).optional(),
  children: z.union([z.boolean(),z.lazy(() => TaskFindManyArgsSchema)]).optional(),
  attachments: z.union([z.boolean(),z.lazy(() => AttachmentFindManyArgsSchema)]).optional(),
  _count: z.union([z.boolean(),z.lazy(() => TaskCountOutputTypeArgsSchema)]).optional(),
}).strict()

// ATTACHMENT
//------------------------------------------------------

export const AttachmentIncludeSchema: z.ZodType<Prisma.AttachmentInclude> = z.object({
  task: z.union([z.boolean(),z.lazy(() => TaskArgsSchema)]).optional(),
}).strict();

export const AttachmentArgsSchema: z.ZodType<Prisma.AttachmentDefaultArgs> = z.object({
  select: z.lazy(() => AttachmentSelectSchema).optional(),
  include: z.lazy(() => AttachmentIncludeSchema).optional(),
}).strict();

export const AttachmentSelectSchema: z.ZodType<Prisma.AttachmentSelect> = z.object({
  id: z.boolean().optional(),
  taskId: z.boolean().optional(),
  name: z.boolean().optional(),
  url: z.boolean().optional(),
  type: z.boolean().optional(),
  createdAt: z.boolean().optional(),
  task: z.union([z.boolean(),z.lazy(() => TaskArgsSchema)]).optional(),
}).strict()


/////////////////////////////////////////
// INPUT TYPES
/////////////////////////////////////////

export const CourseWhereInputSchema: z.ZodType<Prisma.CourseWhereInput> = z.strictObject({
  AND: z.union([ z.lazy(() => CourseWhereInputSchema), z.lazy(() => CourseWhereInputSchema).array() ]).optional(),
  OR: z.lazy(() => CourseWhereInputSchema).array().optional(),
  NOT: z.union([ z.lazy(() => CourseWhereInputSchema), z.lazy(() => CourseWhereInputSchema).array() ]).optional(),
  id: z.union([ z.lazy(() => StringFilterSchema), z.string() ]).optional(),
  userId: z.union([ z.lazy(() => StringFilterSchema), z.string() ]).optional(),
  name: z.union([ z.lazy(() => StringFilterSchema), z.string() ]).optional(),
  rubric: z.lazy(() => JsonNullableFilterSchema).optional(),
  createdAt: z.union([ z.lazy(() => DateTimeFilterSchema), z.coerce.date() ]).optional(),
  updatedAt: z.union([ z.lazy(() => DateTimeFilterSchema), z.coerce.date() ]).optional(),
  tasks: z.lazy(() => TaskListRelationFilterSchema).optional(),
});

export const CourseOrderByWithRelationInputSchema: z.ZodType<Prisma.CourseOrderByWithRelationInput> = z.strictObject({
  id: z.lazy(() => SortOrderSchema).optional(),
  userId: z.lazy(() => SortOrderSchema).optional(),
  name: z.lazy(() => SortOrderSchema).optional(),
  rubric: z.union([ z.lazy(() => SortOrderSchema), z.lazy(() => SortOrderInputSchema) ]).optional(),
  createdAt: z.lazy(() => SortOrderSchema).optional(),
  updatedAt: z.lazy(() => SortOrderSchema).optional(),
  tasks: z.lazy(() => TaskOrderByRelationAggregateInputSchema).optional(),
});

export const CourseWhereUniqueInputSchema: z.ZodType<Prisma.CourseWhereUniqueInput> = z.object({
  id: z.uuid(),
})
.and(z.strictObject({
  id: z.uuid().optional(),
  AND: z.union([ z.lazy(() => CourseWhereInputSchema), z.lazy(() => CourseWhereInputSchema).array() ]).optional(),
  OR: z.lazy(() => CourseWhereInputSchema).array().optional(),
  NOT: z.union([ z.lazy(() => CourseWhereInputSchema), z.lazy(() => CourseWhereInputSchema).array() ]).optional(),
  userId: z.union([ z.lazy(() => StringFilterSchema), z.string() ]).optional(),
  name: z.union([ z.lazy(() => StringFilterSchema), z.string() ]).optional(),
  rubric: z.lazy(() => JsonNullableFilterSchema).optional(),
  createdAt: z.union([ z.lazy(() => DateTimeFilterSchema), z.coerce.date() ]).optional(),
  updatedAt: z.union([ z.lazy(() => DateTimeFilterSchema), z.coerce.date() ]).optional(),
  tasks: z.lazy(() => TaskListRelationFilterSchema).optional(),
}));

export const CourseOrderByWithAggregationInputSchema: z.ZodType<Prisma.CourseOrderByWithAggregationInput> = z.strictObject({
  id: z.lazy(() => SortOrderSchema).optional(),
  userId: z.lazy(() => SortOrderSchema).optional(),
  name: z.lazy(() => SortOrderSchema).optional(),
  rubric: z.union([ z.lazy(() => SortOrderSchema), z.lazy(() => SortOrderInputSchema) ]).optional(),
  createdAt: z.lazy(() => SortOrderSchema).optional(),
  updatedAt: z.lazy(() => SortOrderSchema).optional(),
  _count: z.lazy(() => CourseCountOrderByAggregateInputSchema).optional(),
  _max: z.lazy(() => CourseMaxOrderByAggregateInputSchema).optional(),
  _min: z.lazy(() => CourseMinOrderByAggregateInputSchema).optional(),
});

export const CourseScalarWhereWithAggregatesInputSchema: z.ZodType<Prisma.CourseScalarWhereWithAggregatesInput> = z.strictObject({
  AND: z.union([ z.lazy(() => CourseScalarWhereWithAggregatesInputSchema), z.lazy(() => CourseScalarWhereWithAggregatesInputSchema).array() ]).optional(),
  OR: z.lazy(() => CourseScalarWhereWithAggregatesInputSchema).array().optional(),
  NOT: z.union([ z.lazy(() => CourseScalarWhereWithAggregatesInputSchema), z.lazy(() => CourseScalarWhereWithAggregatesInputSchema).array() ]).optional(),
  id: z.union([ z.lazy(() => StringWithAggregatesFilterSchema), z.string() ]).optional(),
  userId: z.union([ z.lazy(() => StringWithAggregatesFilterSchema), z.string() ]).optional(),
  name: z.union([ z.lazy(() => StringWithAggregatesFilterSchema), z.string() ]).optional(),
  rubric: z.lazy(() => JsonNullableWithAggregatesFilterSchema).optional(),
  createdAt: z.union([ z.lazy(() => DateTimeWithAggregatesFilterSchema), z.coerce.date() ]).optional(),
  updatedAt: z.union([ z.lazy(() => DateTimeWithAggregatesFilterSchema), z.coerce.date() ]).optional(),
});

export const TaskWhereInputSchema: z.ZodType<Prisma.TaskWhereInput> = z.strictObject({
  AND: z.union([ z.lazy(() => TaskWhereInputSchema), z.lazy(() => TaskWhereInputSchema).array() ]).optional(),
  OR: z.lazy(() => TaskWhereInputSchema).array().optional(),
  NOT: z.union([ z.lazy(() => TaskWhereInputSchema), z.lazy(() => TaskWhereInputSchema).array() ]).optional(),
  id: z.union([ z.lazy(() => StringFilterSchema), z.string() ]).optional(),
  userId: z.union([ z.lazy(() => StringFilterSchema), z.string() ]).optional(),
  title: z.union([ z.lazy(() => StringFilterSchema), z.string() ]).optional(),
  description: z.union([ z.lazy(() => StringNullableFilterSchema), z.string() ]).optional().nullable(),
  importance: z.union([ z.lazy(() => IntFilterSchema), z.number() ]).optional(),
  weight: z.union([ z.lazy(() => IntFilterSchema), z.number() ]).optional(),
  deadline: z.union([ z.lazy(() => DateTimeNullableFilterSchema), z.coerce.date() ]).optional().nullable(),
  position: z.union([ z.lazy(() => IntFilterSchema), z.number() ]).optional(),
  type: z.union([ z.lazy(() => StringFilterSchema), z.string() ]).optional(),
  isCompleted: z.union([ z.lazy(() => BoolFilterSchema), z.boolean() ]).optional(),
  estimatedPomodoros: z.union([ z.lazy(() => IntFilterSchema), z.number() ]).optional(),
  courseId: z.union([ z.lazy(() => StringNullableFilterSchema), z.string() ]).optional().nullable(),
  parentId: z.union([ z.lazy(() => StringNullableFilterSchema), z.string() ]).optional().nullable(),
  createdAt: z.union([ z.lazy(() => DateTimeFilterSchema), z.coerce.date() ]).optional(),
  updatedAt: z.union([ z.lazy(() => DateTimeFilterSchema), z.coerce.date() ]).optional(),
  course: z.union([ z.lazy(() => CourseNullableScalarRelationFilterSchema), z.lazy(() => CourseWhereInputSchema) ]).optional().nullable(),
  parent: z.union([ z.lazy(() => TaskNullableScalarRelationFilterSchema), z.lazy(() => TaskWhereInputSchema) ]).optional().nullable(),
  children: z.lazy(() => TaskListRelationFilterSchema).optional(),
  attachments: z.lazy(() => AttachmentListRelationFilterSchema).optional(),
});

export const TaskOrderByWithRelationInputSchema: z.ZodType<Prisma.TaskOrderByWithRelationInput> = z.strictObject({
  id: z.lazy(() => SortOrderSchema).optional(),
  userId: z.lazy(() => SortOrderSchema).optional(),
  title: z.lazy(() => SortOrderSchema).optional(),
  description: z.union([ z.lazy(() => SortOrderSchema), z.lazy(() => SortOrderInputSchema) ]).optional(),
  importance: z.lazy(() => SortOrderSchema).optional(),
  weight: z.lazy(() => SortOrderSchema).optional(),
  deadline: z.union([ z.lazy(() => SortOrderSchema), z.lazy(() => SortOrderInputSchema) ]).optional(),
  position: z.lazy(() => SortOrderSchema).optional(),
  type: z.lazy(() => SortOrderSchema).optional(),
  isCompleted: z.lazy(() => SortOrderSchema).optional(),
  estimatedPomodoros: z.lazy(() => SortOrderSchema).optional(),
  courseId: z.union([ z.lazy(() => SortOrderSchema), z.lazy(() => SortOrderInputSchema) ]).optional(),
  parentId: z.union([ z.lazy(() => SortOrderSchema), z.lazy(() => SortOrderInputSchema) ]).optional(),
  createdAt: z.lazy(() => SortOrderSchema).optional(),
  updatedAt: z.lazy(() => SortOrderSchema).optional(),
  course: z.lazy(() => CourseOrderByWithRelationInputSchema).optional(),
  parent: z.lazy(() => TaskOrderByWithRelationInputSchema).optional(),
  children: z.lazy(() => TaskOrderByRelationAggregateInputSchema).optional(),
  attachments: z.lazy(() => AttachmentOrderByRelationAggregateInputSchema).optional(),
});

export const TaskWhereUniqueInputSchema: z.ZodType<Prisma.TaskWhereUniqueInput> = z.object({
  id: z.uuid(),
})
.and(z.strictObject({
  id: z.uuid().optional(),
  AND: z.union([ z.lazy(() => TaskWhereInputSchema), z.lazy(() => TaskWhereInputSchema).array() ]).optional(),
  OR: z.lazy(() => TaskWhereInputSchema).array().optional(),
  NOT: z.union([ z.lazy(() => TaskWhereInputSchema), z.lazy(() => TaskWhereInputSchema).array() ]).optional(),
  userId: z.union([ z.lazy(() => StringFilterSchema), z.string() ]).optional(),
  title: z.union([ z.lazy(() => StringFilterSchema), z.string() ]).optional(),
  description: z.union([ z.lazy(() => StringNullableFilterSchema), z.string() ]).optional().nullable(),
  importance: z.union([ z.lazy(() => IntFilterSchema), z.number().int() ]).optional(),
  weight: z.union([ z.lazy(() => IntFilterSchema), z.number().int() ]).optional(),
  deadline: z.union([ z.lazy(() => DateTimeNullableFilterSchema), z.coerce.date() ]).optional().nullable(),
  position: z.union([ z.lazy(() => IntFilterSchema), z.number().int() ]).optional(),
  type: z.union([ z.lazy(() => StringFilterSchema), z.string() ]).optional(),
  isCompleted: z.union([ z.lazy(() => BoolFilterSchema), z.boolean() ]).optional(),
  estimatedPomodoros: z.union([ z.lazy(() => IntFilterSchema), z.number().int() ]).optional(),
  courseId: z.union([ z.lazy(() => StringNullableFilterSchema), z.string() ]).optional().nullable(),
  parentId: z.union([ z.lazy(() => StringNullableFilterSchema), z.string() ]).optional().nullable(),
  createdAt: z.union([ z.lazy(() => DateTimeFilterSchema), z.coerce.date() ]).optional(),
  updatedAt: z.union([ z.lazy(() => DateTimeFilterSchema), z.coerce.date() ]).optional(),
  course: z.union([ z.lazy(() => CourseNullableScalarRelationFilterSchema), z.lazy(() => CourseWhereInputSchema) ]).optional().nullable(),
  parent: z.union([ z.lazy(() => TaskNullableScalarRelationFilterSchema), z.lazy(() => TaskWhereInputSchema) ]).optional().nullable(),
  children: z.lazy(() => TaskListRelationFilterSchema).optional(),
  attachments: z.lazy(() => AttachmentListRelationFilterSchema).optional(),
}));

export const TaskOrderByWithAggregationInputSchema: z.ZodType<Prisma.TaskOrderByWithAggregationInput> = z.strictObject({
  id: z.lazy(() => SortOrderSchema).optional(),
  userId: z.lazy(() => SortOrderSchema).optional(),
  title: z.lazy(() => SortOrderSchema).optional(),
  description: z.union([ z.lazy(() => SortOrderSchema), z.lazy(() => SortOrderInputSchema) ]).optional(),
  importance: z.lazy(() => SortOrderSchema).optional(),
  weight: z.lazy(() => SortOrderSchema).optional(),
  deadline: z.union([ z.lazy(() => SortOrderSchema), z.lazy(() => SortOrderInputSchema) ]).optional(),
  position: z.lazy(() => SortOrderSchema).optional(),
  type: z.lazy(() => SortOrderSchema).optional(),
  isCompleted: z.lazy(() => SortOrderSchema).optional(),
  estimatedPomodoros: z.lazy(() => SortOrderSchema).optional(),
  courseId: z.union([ z.lazy(() => SortOrderSchema), z.lazy(() => SortOrderInputSchema) ]).optional(),
  parentId: z.union([ z.lazy(() => SortOrderSchema), z.lazy(() => SortOrderInputSchema) ]).optional(),
  createdAt: z.lazy(() => SortOrderSchema).optional(),
  updatedAt: z.lazy(() => SortOrderSchema).optional(),
  _count: z.lazy(() => TaskCountOrderByAggregateInputSchema).optional(),
  _avg: z.lazy(() => TaskAvgOrderByAggregateInputSchema).optional(),
  _max: z.lazy(() => TaskMaxOrderByAggregateInputSchema).optional(),
  _min: z.lazy(() => TaskMinOrderByAggregateInputSchema).optional(),
  _sum: z.lazy(() => TaskSumOrderByAggregateInputSchema).optional(),
});

export const TaskScalarWhereWithAggregatesInputSchema: z.ZodType<Prisma.TaskScalarWhereWithAggregatesInput> = z.strictObject({
  AND: z.union([ z.lazy(() => TaskScalarWhereWithAggregatesInputSchema), z.lazy(() => TaskScalarWhereWithAggregatesInputSchema).array() ]).optional(),
  OR: z.lazy(() => TaskScalarWhereWithAggregatesInputSchema).array().optional(),
  NOT: z.union([ z.lazy(() => TaskScalarWhereWithAggregatesInputSchema), z.lazy(() => TaskScalarWhereWithAggregatesInputSchema).array() ]).optional(),
  id: z.union([ z.lazy(() => StringWithAggregatesFilterSchema), z.string() ]).optional(),
  userId: z.union([ z.lazy(() => StringWithAggregatesFilterSchema), z.string() ]).optional(),
  title: z.union([ z.lazy(() => StringWithAggregatesFilterSchema), z.string() ]).optional(),
  description: z.union([ z.lazy(() => StringNullableWithAggregatesFilterSchema), z.string() ]).optional().nullable(),
  importance: z.union([ z.lazy(() => IntWithAggregatesFilterSchema), z.number() ]).optional(),
  weight: z.union([ z.lazy(() => IntWithAggregatesFilterSchema), z.number() ]).optional(),
  deadline: z.union([ z.lazy(() => DateTimeNullableWithAggregatesFilterSchema), z.coerce.date() ]).optional().nullable(),
  position: z.union([ z.lazy(() => IntWithAggregatesFilterSchema), z.number() ]).optional(),
  type: z.union([ z.lazy(() => StringWithAggregatesFilterSchema), z.string() ]).optional(),
  isCompleted: z.union([ z.lazy(() => BoolWithAggregatesFilterSchema), z.boolean() ]).optional(),
  estimatedPomodoros: z.union([ z.lazy(() => IntWithAggregatesFilterSchema), z.number() ]).optional(),
  courseId: z.union([ z.lazy(() => StringNullableWithAggregatesFilterSchema), z.string() ]).optional().nullable(),
  parentId: z.union([ z.lazy(() => StringNullableWithAggregatesFilterSchema), z.string() ]).optional().nullable(),
  createdAt: z.union([ z.lazy(() => DateTimeWithAggregatesFilterSchema), z.coerce.date() ]).optional(),
  updatedAt: z.union([ z.lazy(() => DateTimeWithAggregatesFilterSchema), z.coerce.date() ]).optional(),
});

export const AttachmentWhereInputSchema: z.ZodType<Prisma.AttachmentWhereInput> = z.strictObject({
  AND: z.union([ z.lazy(() => AttachmentWhereInputSchema), z.lazy(() => AttachmentWhereInputSchema).array() ]).optional(),
  OR: z.lazy(() => AttachmentWhereInputSchema).array().optional(),
  NOT: z.union([ z.lazy(() => AttachmentWhereInputSchema), z.lazy(() => AttachmentWhereInputSchema).array() ]).optional(),
  id: z.union([ z.lazy(() => StringFilterSchema), z.string() ]).optional(),
  taskId: z.union([ z.lazy(() => StringFilterSchema), z.string() ]).optional(),
  name: z.union([ z.lazy(() => StringFilterSchema), z.string() ]).optional(),
  url: z.union([ z.lazy(() => StringFilterSchema), z.string() ]).optional(),
  type: z.union([ z.lazy(() => StringFilterSchema), z.string() ]).optional(),
  createdAt: z.union([ z.lazy(() => DateTimeFilterSchema), z.coerce.date() ]).optional(),
  task: z.union([ z.lazy(() => TaskScalarRelationFilterSchema), z.lazy(() => TaskWhereInputSchema) ]).optional(),
});

export const AttachmentOrderByWithRelationInputSchema: z.ZodType<Prisma.AttachmentOrderByWithRelationInput> = z.strictObject({
  id: z.lazy(() => SortOrderSchema).optional(),
  taskId: z.lazy(() => SortOrderSchema).optional(),
  name: z.lazy(() => SortOrderSchema).optional(),
  url: z.lazy(() => SortOrderSchema).optional(),
  type: z.lazy(() => SortOrderSchema).optional(),
  createdAt: z.lazy(() => SortOrderSchema).optional(),
  task: z.lazy(() => TaskOrderByWithRelationInputSchema).optional(),
});

export const AttachmentWhereUniqueInputSchema: z.ZodType<Prisma.AttachmentWhereUniqueInput> = z.object({
  id: z.uuid(),
})
.and(z.strictObject({
  id: z.uuid().optional(),
  AND: z.union([ z.lazy(() => AttachmentWhereInputSchema), z.lazy(() => AttachmentWhereInputSchema).array() ]).optional(),
  OR: z.lazy(() => AttachmentWhereInputSchema).array().optional(),
  NOT: z.union([ z.lazy(() => AttachmentWhereInputSchema), z.lazy(() => AttachmentWhereInputSchema).array() ]).optional(),
  taskId: z.union([ z.lazy(() => StringFilterSchema), z.string() ]).optional(),
  name: z.union([ z.lazy(() => StringFilterSchema), z.string() ]).optional(),
  url: z.union([ z.lazy(() => StringFilterSchema), z.string() ]).optional(),
  type: z.union([ z.lazy(() => StringFilterSchema), z.string() ]).optional(),
  createdAt: z.union([ z.lazy(() => DateTimeFilterSchema), z.coerce.date() ]).optional(),
  task: z.union([ z.lazy(() => TaskScalarRelationFilterSchema), z.lazy(() => TaskWhereInputSchema) ]).optional(),
}));

export const AttachmentOrderByWithAggregationInputSchema: z.ZodType<Prisma.AttachmentOrderByWithAggregationInput> = z.strictObject({
  id: z.lazy(() => SortOrderSchema).optional(),
  taskId: z.lazy(() => SortOrderSchema).optional(),
  name: z.lazy(() => SortOrderSchema).optional(),
  url: z.lazy(() => SortOrderSchema).optional(),
  type: z.lazy(() => SortOrderSchema).optional(),
  createdAt: z.lazy(() => SortOrderSchema).optional(),
  _count: z.lazy(() => AttachmentCountOrderByAggregateInputSchema).optional(),
  _max: z.lazy(() => AttachmentMaxOrderByAggregateInputSchema).optional(),
  _min: z.lazy(() => AttachmentMinOrderByAggregateInputSchema).optional(),
});

export const AttachmentScalarWhereWithAggregatesInputSchema: z.ZodType<Prisma.AttachmentScalarWhereWithAggregatesInput> = z.strictObject({
  AND: z.union([ z.lazy(() => AttachmentScalarWhereWithAggregatesInputSchema), z.lazy(() => AttachmentScalarWhereWithAggregatesInputSchema).array() ]).optional(),
  OR: z.lazy(() => AttachmentScalarWhereWithAggregatesInputSchema).array().optional(),
  NOT: z.union([ z.lazy(() => AttachmentScalarWhereWithAggregatesInputSchema), z.lazy(() => AttachmentScalarWhereWithAggregatesInputSchema).array() ]).optional(),
  id: z.union([ z.lazy(() => StringWithAggregatesFilterSchema), z.string() ]).optional(),
  taskId: z.union([ z.lazy(() => StringWithAggregatesFilterSchema), z.string() ]).optional(),
  name: z.union([ z.lazy(() => StringWithAggregatesFilterSchema), z.string() ]).optional(),
  url: z.union([ z.lazy(() => StringWithAggregatesFilterSchema), z.string() ]).optional(),
  type: z.union([ z.lazy(() => StringWithAggregatesFilterSchema), z.string() ]).optional(),
  createdAt: z.union([ z.lazy(() => DateTimeWithAggregatesFilterSchema), z.coerce.date() ]).optional(),
});

export const CourseCreateInputSchema: z.ZodType<Prisma.CourseCreateInput> = z.strictObject({
  id: z.uuid().optional(),
  userId: z.string(),
  name: z.string(),
  rubric: z.union([ z.lazy(() => NullableJsonNullValueInputSchema), InputJsonValueSchema ]).optional(),
  createdAt: z.coerce.date().optional(),
  updatedAt: z.coerce.date().optional(),
  tasks: z.lazy(() => TaskCreateNestedManyWithoutCourseInputSchema).optional(),
});

export const CourseUncheckedCreateInputSchema: z.ZodType<Prisma.CourseUncheckedCreateInput> = z.strictObject({
  id: z.uuid().optional(),
  userId: z.string(),
  name: z.string(),
  rubric: z.union([ z.lazy(() => NullableJsonNullValueInputSchema), InputJsonValueSchema ]).optional(),
  createdAt: z.coerce.date().optional(),
  updatedAt: z.coerce.date().optional(),
  tasks: z.lazy(() => TaskUncheckedCreateNestedManyWithoutCourseInputSchema).optional(),
});

export const CourseUpdateInputSchema: z.ZodType<Prisma.CourseUpdateInput> = z.strictObject({
  id: z.union([ z.uuid(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  userId: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  name: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  rubric: z.union([ z.lazy(() => NullableJsonNullValueInputSchema), InputJsonValueSchema ]).optional(),
  createdAt: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  updatedAt: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  tasks: z.lazy(() => TaskUpdateManyWithoutCourseNestedInputSchema).optional(),
});

export const CourseUncheckedUpdateInputSchema: z.ZodType<Prisma.CourseUncheckedUpdateInput> = z.strictObject({
  id: z.union([ z.uuid(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  userId: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  name: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  rubric: z.union([ z.lazy(() => NullableJsonNullValueInputSchema), InputJsonValueSchema ]).optional(),
  createdAt: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  updatedAt: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  tasks: z.lazy(() => TaskUncheckedUpdateManyWithoutCourseNestedInputSchema).optional(),
});

export const CourseCreateManyInputSchema: z.ZodType<Prisma.CourseCreateManyInput> = z.strictObject({
  id: z.uuid().optional(),
  userId: z.string(),
  name: z.string(),
  rubric: z.union([ z.lazy(() => NullableJsonNullValueInputSchema), InputJsonValueSchema ]).optional(),
  createdAt: z.coerce.date().optional(),
  updatedAt: z.coerce.date().optional(),
});

export const CourseUpdateManyMutationInputSchema: z.ZodType<Prisma.CourseUpdateManyMutationInput> = z.strictObject({
  id: z.union([ z.uuid(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  userId: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  name: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  rubric: z.union([ z.lazy(() => NullableJsonNullValueInputSchema), InputJsonValueSchema ]).optional(),
  createdAt: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  updatedAt: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
});

export const CourseUncheckedUpdateManyInputSchema: z.ZodType<Prisma.CourseUncheckedUpdateManyInput> = z.strictObject({
  id: z.union([ z.uuid(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  userId: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  name: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  rubric: z.union([ z.lazy(() => NullableJsonNullValueInputSchema), InputJsonValueSchema ]).optional(),
  createdAt: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  updatedAt: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
});

export const TaskCreateInputSchema: z.ZodType<Prisma.TaskCreateInput> = z.strictObject({
  id: z.uuid().optional(),
  userId: z.string(),
  title: z.string(),
  description: z.string().optional().nullable(),
  importance: z.number().int().optional(),
  weight: z.number().int().optional(),
  deadline: z.coerce.date().optional().nullable(),
  position: z.number().int().optional(),
  type: z.string().optional(),
  isCompleted: z.boolean().optional(),
  estimatedPomodoros: z.number().int().optional(),
  createdAt: z.coerce.date().optional(),
  updatedAt: z.coerce.date().optional(),
  course: z.lazy(() => CourseCreateNestedOneWithoutTasksInputSchema).optional(),
  parent: z.lazy(() => TaskCreateNestedOneWithoutChildrenInputSchema).optional(),
  children: z.lazy(() => TaskCreateNestedManyWithoutParentInputSchema).optional(),
  attachments: z.lazy(() => AttachmentCreateNestedManyWithoutTaskInputSchema).optional(),
});

export const TaskUncheckedCreateInputSchema: z.ZodType<Prisma.TaskUncheckedCreateInput> = z.strictObject({
  id: z.uuid().optional(),
  userId: z.string(),
  title: z.string(),
  description: z.string().optional().nullable(),
  importance: z.number().int().optional(),
  weight: z.number().int().optional(),
  deadline: z.coerce.date().optional().nullable(),
  position: z.number().int().optional(),
  type: z.string().optional(),
  isCompleted: z.boolean().optional(),
  estimatedPomodoros: z.number().int().optional(),
  courseId: z.string().optional().nullable(),
  parentId: z.string().optional().nullable(),
  createdAt: z.coerce.date().optional(),
  updatedAt: z.coerce.date().optional(),
  children: z.lazy(() => TaskUncheckedCreateNestedManyWithoutParentInputSchema).optional(),
  attachments: z.lazy(() => AttachmentUncheckedCreateNestedManyWithoutTaskInputSchema).optional(),
});

export const TaskUpdateInputSchema: z.ZodType<Prisma.TaskUpdateInput> = z.strictObject({
  id: z.union([ z.uuid(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  userId: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  title: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  description: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  importance: z.union([ z.number().int(),z.lazy(() => IntFieldUpdateOperationsInputSchema) ]).optional(),
  weight: z.union([ z.number().int(),z.lazy(() => IntFieldUpdateOperationsInputSchema) ]).optional(),
  deadline: z.union([ z.coerce.date(),z.lazy(() => NullableDateTimeFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  position: z.union([ z.number().int(),z.lazy(() => IntFieldUpdateOperationsInputSchema) ]).optional(),
  type: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  isCompleted: z.union([ z.boolean(),z.lazy(() => BoolFieldUpdateOperationsInputSchema) ]).optional(),
  estimatedPomodoros: z.union([ z.number().int(),z.lazy(() => IntFieldUpdateOperationsInputSchema) ]).optional(),
  createdAt: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  updatedAt: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  course: z.lazy(() => CourseUpdateOneWithoutTasksNestedInputSchema).optional(),
  parent: z.lazy(() => TaskUpdateOneWithoutChildrenNestedInputSchema).optional(),
  children: z.lazy(() => TaskUpdateManyWithoutParentNestedInputSchema).optional(),
  attachments: z.lazy(() => AttachmentUpdateManyWithoutTaskNestedInputSchema).optional(),
});

export const TaskUncheckedUpdateInputSchema: z.ZodType<Prisma.TaskUncheckedUpdateInput> = z.strictObject({
  id: z.union([ z.uuid(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  userId: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  title: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  description: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  importance: z.union([ z.number().int(),z.lazy(() => IntFieldUpdateOperationsInputSchema) ]).optional(),
  weight: z.union([ z.number().int(),z.lazy(() => IntFieldUpdateOperationsInputSchema) ]).optional(),
  deadline: z.union([ z.coerce.date(),z.lazy(() => NullableDateTimeFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  position: z.union([ z.number().int(),z.lazy(() => IntFieldUpdateOperationsInputSchema) ]).optional(),
  type: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  isCompleted: z.union([ z.boolean(),z.lazy(() => BoolFieldUpdateOperationsInputSchema) ]).optional(),
  estimatedPomodoros: z.union([ z.number().int(),z.lazy(() => IntFieldUpdateOperationsInputSchema) ]).optional(),
  courseId: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  parentId: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  createdAt: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  updatedAt: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  children: z.lazy(() => TaskUncheckedUpdateManyWithoutParentNestedInputSchema).optional(),
  attachments: z.lazy(() => AttachmentUncheckedUpdateManyWithoutTaskNestedInputSchema).optional(),
});

export const TaskCreateManyInputSchema: z.ZodType<Prisma.TaskCreateManyInput> = z.strictObject({
  id: z.uuid().optional(),
  userId: z.string(),
  title: z.string(),
  description: z.string().optional().nullable(),
  importance: z.number().int().optional(),
  weight: z.number().int().optional(),
  deadline: z.coerce.date().optional().nullable(),
  position: z.number().int().optional(),
  type: z.string().optional(),
  isCompleted: z.boolean().optional(),
  estimatedPomodoros: z.number().int().optional(),
  courseId: z.string().optional().nullable(),
  parentId: z.string().optional().nullable(),
  createdAt: z.coerce.date().optional(),
  updatedAt: z.coerce.date().optional(),
});

export const TaskUpdateManyMutationInputSchema: z.ZodType<Prisma.TaskUpdateManyMutationInput> = z.strictObject({
  id: z.union([ z.uuid(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  userId: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  title: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  description: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  importance: z.union([ z.number().int(),z.lazy(() => IntFieldUpdateOperationsInputSchema) ]).optional(),
  weight: z.union([ z.number().int(),z.lazy(() => IntFieldUpdateOperationsInputSchema) ]).optional(),
  deadline: z.union([ z.coerce.date(),z.lazy(() => NullableDateTimeFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  position: z.union([ z.number().int(),z.lazy(() => IntFieldUpdateOperationsInputSchema) ]).optional(),
  type: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  isCompleted: z.union([ z.boolean(),z.lazy(() => BoolFieldUpdateOperationsInputSchema) ]).optional(),
  estimatedPomodoros: z.union([ z.number().int(),z.lazy(() => IntFieldUpdateOperationsInputSchema) ]).optional(),
  createdAt: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  updatedAt: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
});

export const TaskUncheckedUpdateManyInputSchema: z.ZodType<Prisma.TaskUncheckedUpdateManyInput> = z.strictObject({
  id: z.union([ z.uuid(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  userId: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  title: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  description: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  importance: z.union([ z.number().int(),z.lazy(() => IntFieldUpdateOperationsInputSchema) ]).optional(),
  weight: z.union([ z.number().int(),z.lazy(() => IntFieldUpdateOperationsInputSchema) ]).optional(),
  deadline: z.union([ z.coerce.date(),z.lazy(() => NullableDateTimeFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  position: z.union([ z.number().int(),z.lazy(() => IntFieldUpdateOperationsInputSchema) ]).optional(),
  type: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  isCompleted: z.union([ z.boolean(),z.lazy(() => BoolFieldUpdateOperationsInputSchema) ]).optional(),
  estimatedPomodoros: z.union([ z.number().int(),z.lazy(() => IntFieldUpdateOperationsInputSchema) ]).optional(),
  courseId: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  parentId: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  createdAt: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  updatedAt: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
});

export const AttachmentCreateInputSchema: z.ZodType<Prisma.AttachmentCreateInput> = z.strictObject({
  id: z.uuid().optional(),
  name: z.string(),
  url: z.string(),
  type: z.string(),
  createdAt: z.coerce.date().optional(),
  task: z.lazy(() => TaskCreateNestedOneWithoutAttachmentsInputSchema),
});

export const AttachmentUncheckedCreateInputSchema: z.ZodType<Prisma.AttachmentUncheckedCreateInput> = z.strictObject({
  id: z.uuid().optional(),
  taskId: z.string(),
  name: z.string(),
  url: z.string(),
  type: z.string(),
  createdAt: z.coerce.date().optional(),
});

export const AttachmentUpdateInputSchema: z.ZodType<Prisma.AttachmentUpdateInput> = z.strictObject({
  id: z.union([ z.uuid(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  name: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  url: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  type: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  createdAt: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  task: z.lazy(() => TaskUpdateOneRequiredWithoutAttachmentsNestedInputSchema).optional(),
});

export const AttachmentUncheckedUpdateInputSchema: z.ZodType<Prisma.AttachmentUncheckedUpdateInput> = z.strictObject({
  id: z.union([ z.uuid(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  taskId: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  name: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  url: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  type: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  createdAt: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
});

export const AttachmentCreateManyInputSchema: z.ZodType<Prisma.AttachmentCreateManyInput> = z.strictObject({
  id: z.uuid().optional(),
  taskId: z.string(),
  name: z.string(),
  url: z.string(),
  type: z.string(),
  createdAt: z.coerce.date().optional(),
});

export const AttachmentUpdateManyMutationInputSchema: z.ZodType<Prisma.AttachmentUpdateManyMutationInput> = z.strictObject({
  id: z.union([ z.uuid(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  name: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  url: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  type: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  createdAt: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
});

export const AttachmentUncheckedUpdateManyInputSchema: z.ZodType<Prisma.AttachmentUncheckedUpdateManyInput> = z.strictObject({
  id: z.union([ z.uuid(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  taskId: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  name: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  url: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  type: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  createdAt: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
});

export const StringFilterSchema: z.ZodType<Prisma.StringFilter> = z.strictObject({
  equals: z.string().optional(),
  in: z.string().array().optional(),
  notIn: z.string().array().optional(),
  lt: z.string().optional(),
  lte: z.string().optional(),
  gt: z.string().optional(),
  gte: z.string().optional(),
  contains: z.string().optional(),
  startsWith: z.string().optional(),
  endsWith: z.string().optional(),
  mode: z.lazy(() => QueryModeSchema).optional(),
  not: z.union([ z.string(),z.lazy(() => NestedStringFilterSchema) ]).optional(),
});

export const JsonNullableFilterSchema: z.ZodType<Prisma.JsonNullableFilter> = z.strictObject({
  equals: InputJsonValueSchema.optional(),
  path: z.string().array().optional(),
  mode: z.lazy(() => QueryModeSchema).optional(),
  string_contains: z.string().optional(),
  string_starts_with: z.string().optional(),
  string_ends_with: z.string().optional(),
  array_starts_with: InputJsonValueSchema.optional().nullable(),
  array_ends_with: InputJsonValueSchema.optional().nullable(),
  array_contains: InputJsonValueSchema.optional().nullable(),
  lt: InputJsonValueSchema.optional(),
  lte: InputJsonValueSchema.optional(),
  gt: InputJsonValueSchema.optional(),
  gte: InputJsonValueSchema.optional(),
  not: InputJsonValueSchema.optional(),
});

export const DateTimeFilterSchema: z.ZodType<Prisma.DateTimeFilter> = z.strictObject({
  equals: z.coerce.date().optional(),
  in: z.coerce.date().array().optional(),
  notIn: z.coerce.date().array().optional(),
  lt: z.coerce.date().optional(),
  lte: z.coerce.date().optional(),
  gt: z.coerce.date().optional(),
  gte: z.coerce.date().optional(),
  not: z.union([ z.coerce.date(),z.lazy(() => NestedDateTimeFilterSchema) ]).optional(),
});

export const TaskListRelationFilterSchema: z.ZodType<Prisma.TaskListRelationFilter> = z.strictObject({
  every: z.lazy(() => TaskWhereInputSchema).optional(),
  some: z.lazy(() => TaskWhereInputSchema).optional(),
  none: z.lazy(() => TaskWhereInputSchema).optional(),
});

export const SortOrderInputSchema: z.ZodType<Prisma.SortOrderInput> = z.strictObject({
  sort: z.lazy(() => SortOrderSchema),
  nulls: z.lazy(() => NullsOrderSchema).optional(),
});

export const TaskOrderByRelationAggregateInputSchema: z.ZodType<Prisma.TaskOrderByRelationAggregateInput> = z.strictObject({
  _count: z.lazy(() => SortOrderSchema).optional(),
});

export const CourseCountOrderByAggregateInputSchema: z.ZodType<Prisma.CourseCountOrderByAggregateInput> = z.strictObject({
  id: z.lazy(() => SortOrderSchema).optional(),
  userId: z.lazy(() => SortOrderSchema).optional(),
  name: z.lazy(() => SortOrderSchema).optional(),
  rubric: z.lazy(() => SortOrderSchema).optional(),
  createdAt: z.lazy(() => SortOrderSchema).optional(),
  updatedAt: z.lazy(() => SortOrderSchema).optional(),
});

export const CourseMaxOrderByAggregateInputSchema: z.ZodType<Prisma.CourseMaxOrderByAggregateInput> = z.strictObject({
  id: z.lazy(() => SortOrderSchema).optional(),
  userId: z.lazy(() => SortOrderSchema).optional(),
  name: z.lazy(() => SortOrderSchema).optional(),
  createdAt: z.lazy(() => SortOrderSchema).optional(),
  updatedAt: z.lazy(() => SortOrderSchema).optional(),
});

export const CourseMinOrderByAggregateInputSchema: z.ZodType<Prisma.CourseMinOrderByAggregateInput> = z.strictObject({
  id: z.lazy(() => SortOrderSchema).optional(),
  userId: z.lazy(() => SortOrderSchema).optional(),
  name: z.lazy(() => SortOrderSchema).optional(),
  createdAt: z.lazy(() => SortOrderSchema).optional(),
  updatedAt: z.lazy(() => SortOrderSchema).optional(),
});

export const StringWithAggregatesFilterSchema: z.ZodType<Prisma.StringWithAggregatesFilter> = z.strictObject({
  equals: z.string().optional(),
  in: z.string().array().optional(),
  notIn: z.string().array().optional(),
  lt: z.string().optional(),
  lte: z.string().optional(),
  gt: z.string().optional(),
  gte: z.string().optional(),
  contains: z.string().optional(),
  startsWith: z.string().optional(),
  endsWith: z.string().optional(),
  mode: z.lazy(() => QueryModeSchema).optional(),
  not: z.union([ z.string(),z.lazy(() => NestedStringWithAggregatesFilterSchema) ]).optional(),
  _count: z.lazy(() => NestedIntFilterSchema).optional(),
  _min: z.lazy(() => NestedStringFilterSchema).optional(),
  _max: z.lazy(() => NestedStringFilterSchema).optional(),
});

export const JsonNullableWithAggregatesFilterSchema: z.ZodType<Prisma.JsonNullableWithAggregatesFilter> = z.strictObject({
  equals: InputJsonValueSchema.optional(),
  path: z.string().array().optional(),
  mode: z.lazy(() => QueryModeSchema).optional(),
  string_contains: z.string().optional(),
  string_starts_with: z.string().optional(),
  string_ends_with: z.string().optional(),
  array_starts_with: InputJsonValueSchema.optional().nullable(),
  array_ends_with: InputJsonValueSchema.optional().nullable(),
  array_contains: InputJsonValueSchema.optional().nullable(),
  lt: InputJsonValueSchema.optional(),
  lte: InputJsonValueSchema.optional(),
  gt: InputJsonValueSchema.optional(),
  gte: InputJsonValueSchema.optional(),
  not: InputJsonValueSchema.optional(),
  _count: z.lazy(() => NestedIntNullableFilterSchema).optional(),
  _min: z.lazy(() => NestedJsonNullableFilterSchema).optional(),
  _max: z.lazy(() => NestedJsonNullableFilterSchema).optional(),
});

export const DateTimeWithAggregatesFilterSchema: z.ZodType<Prisma.DateTimeWithAggregatesFilter> = z.strictObject({
  equals: z.coerce.date().optional(),
  in: z.coerce.date().array().optional(),
  notIn: z.coerce.date().array().optional(),
  lt: z.coerce.date().optional(),
  lte: z.coerce.date().optional(),
  gt: z.coerce.date().optional(),
  gte: z.coerce.date().optional(),
  not: z.union([ z.coerce.date(),z.lazy(() => NestedDateTimeWithAggregatesFilterSchema) ]).optional(),
  _count: z.lazy(() => NestedIntFilterSchema).optional(),
  _min: z.lazy(() => NestedDateTimeFilterSchema).optional(),
  _max: z.lazy(() => NestedDateTimeFilterSchema).optional(),
});

export const StringNullableFilterSchema: z.ZodType<Prisma.StringNullableFilter> = z.strictObject({
  equals: z.string().optional().nullable(),
  in: z.string().array().optional().nullable(),
  notIn: z.string().array().optional().nullable(),
  lt: z.string().optional(),
  lte: z.string().optional(),
  gt: z.string().optional(),
  gte: z.string().optional(),
  contains: z.string().optional(),
  startsWith: z.string().optional(),
  endsWith: z.string().optional(),
  mode: z.lazy(() => QueryModeSchema).optional(),
  not: z.union([ z.string(),z.lazy(() => NestedStringNullableFilterSchema) ]).optional().nullable(),
});

export const IntFilterSchema: z.ZodType<Prisma.IntFilter> = z.strictObject({
  equals: z.number().optional(),
  in: z.number().array().optional(),
  notIn: z.number().array().optional(),
  lt: z.number().optional(),
  lte: z.number().optional(),
  gt: z.number().optional(),
  gte: z.number().optional(),
  not: z.union([ z.number(),z.lazy(() => NestedIntFilterSchema) ]).optional(),
});

export const DateTimeNullableFilterSchema: z.ZodType<Prisma.DateTimeNullableFilter> = z.strictObject({
  equals: z.coerce.date().optional().nullable(),
  in: z.coerce.date().array().optional().nullable(),
  notIn: z.coerce.date().array().optional().nullable(),
  lt: z.coerce.date().optional(),
  lte: z.coerce.date().optional(),
  gt: z.coerce.date().optional(),
  gte: z.coerce.date().optional(),
  not: z.union([ z.coerce.date(),z.lazy(() => NestedDateTimeNullableFilterSchema) ]).optional().nullable(),
});

export const BoolFilterSchema: z.ZodType<Prisma.BoolFilter> = z.strictObject({
  equals: z.boolean().optional(),
  not: z.union([ z.boolean(),z.lazy(() => NestedBoolFilterSchema) ]).optional(),
});

export const CourseNullableScalarRelationFilterSchema: z.ZodType<Prisma.CourseNullableScalarRelationFilter> = z.strictObject({
  is: z.lazy(() => CourseWhereInputSchema).optional().nullable(),
  isNot: z.lazy(() => CourseWhereInputSchema).optional().nullable(),
});

export const TaskNullableScalarRelationFilterSchema: z.ZodType<Prisma.TaskNullableScalarRelationFilter> = z.strictObject({
  is: z.lazy(() => TaskWhereInputSchema).optional().nullable(),
  isNot: z.lazy(() => TaskWhereInputSchema).optional().nullable(),
});

export const AttachmentListRelationFilterSchema: z.ZodType<Prisma.AttachmentListRelationFilter> = z.strictObject({
  every: z.lazy(() => AttachmentWhereInputSchema).optional(),
  some: z.lazy(() => AttachmentWhereInputSchema).optional(),
  none: z.lazy(() => AttachmentWhereInputSchema).optional(),
});

export const AttachmentOrderByRelationAggregateInputSchema: z.ZodType<Prisma.AttachmentOrderByRelationAggregateInput> = z.strictObject({
  _count: z.lazy(() => SortOrderSchema).optional(),
});

export const TaskCountOrderByAggregateInputSchema: z.ZodType<Prisma.TaskCountOrderByAggregateInput> = z.strictObject({
  id: z.lazy(() => SortOrderSchema).optional(),
  userId: z.lazy(() => SortOrderSchema).optional(),
  title: z.lazy(() => SortOrderSchema).optional(),
  description: z.lazy(() => SortOrderSchema).optional(),
  importance: z.lazy(() => SortOrderSchema).optional(),
  weight: z.lazy(() => SortOrderSchema).optional(),
  deadline: z.lazy(() => SortOrderSchema).optional(),
  position: z.lazy(() => SortOrderSchema).optional(),
  type: z.lazy(() => SortOrderSchema).optional(),
  isCompleted: z.lazy(() => SortOrderSchema).optional(),
  estimatedPomodoros: z.lazy(() => SortOrderSchema).optional(),
  courseId: z.lazy(() => SortOrderSchema).optional(),
  parentId: z.lazy(() => SortOrderSchema).optional(),
  createdAt: z.lazy(() => SortOrderSchema).optional(),
  updatedAt: z.lazy(() => SortOrderSchema).optional(),
});

export const TaskAvgOrderByAggregateInputSchema: z.ZodType<Prisma.TaskAvgOrderByAggregateInput> = z.strictObject({
  importance: z.lazy(() => SortOrderSchema).optional(),
  weight: z.lazy(() => SortOrderSchema).optional(),
  position: z.lazy(() => SortOrderSchema).optional(),
  estimatedPomodoros: z.lazy(() => SortOrderSchema).optional(),
});

export const TaskMaxOrderByAggregateInputSchema: z.ZodType<Prisma.TaskMaxOrderByAggregateInput> = z.strictObject({
  id: z.lazy(() => SortOrderSchema).optional(),
  userId: z.lazy(() => SortOrderSchema).optional(),
  title: z.lazy(() => SortOrderSchema).optional(),
  description: z.lazy(() => SortOrderSchema).optional(),
  importance: z.lazy(() => SortOrderSchema).optional(),
  weight: z.lazy(() => SortOrderSchema).optional(),
  deadline: z.lazy(() => SortOrderSchema).optional(),
  position: z.lazy(() => SortOrderSchema).optional(),
  type: z.lazy(() => SortOrderSchema).optional(),
  isCompleted: z.lazy(() => SortOrderSchema).optional(),
  estimatedPomodoros: z.lazy(() => SortOrderSchema).optional(),
  courseId: z.lazy(() => SortOrderSchema).optional(),
  parentId: z.lazy(() => SortOrderSchema).optional(),
  createdAt: z.lazy(() => SortOrderSchema).optional(),
  updatedAt: z.lazy(() => SortOrderSchema).optional(),
});

export const TaskMinOrderByAggregateInputSchema: z.ZodType<Prisma.TaskMinOrderByAggregateInput> = z.strictObject({
  id: z.lazy(() => SortOrderSchema).optional(),
  userId: z.lazy(() => SortOrderSchema).optional(),
  title: z.lazy(() => SortOrderSchema).optional(),
  description: z.lazy(() => SortOrderSchema).optional(),
  importance: z.lazy(() => SortOrderSchema).optional(),
  weight: z.lazy(() => SortOrderSchema).optional(),
  deadline: z.lazy(() => SortOrderSchema).optional(),
  position: z.lazy(() => SortOrderSchema).optional(),
  type: z.lazy(() => SortOrderSchema).optional(),
  isCompleted: z.lazy(() => SortOrderSchema).optional(),
  estimatedPomodoros: z.lazy(() => SortOrderSchema).optional(),
  courseId: z.lazy(() => SortOrderSchema).optional(),
  parentId: z.lazy(() => SortOrderSchema).optional(),
  createdAt: z.lazy(() => SortOrderSchema).optional(),
  updatedAt: z.lazy(() => SortOrderSchema).optional(),
});

export const TaskSumOrderByAggregateInputSchema: z.ZodType<Prisma.TaskSumOrderByAggregateInput> = z.strictObject({
  importance: z.lazy(() => SortOrderSchema).optional(),
  weight: z.lazy(() => SortOrderSchema).optional(),
  position: z.lazy(() => SortOrderSchema).optional(),
  estimatedPomodoros: z.lazy(() => SortOrderSchema).optional(),
});

export const StringNullableWithAggregatesFilterSchema: z.ZodType<Prisma.StringNullableWithAggregatesFilter> = z.strictObject({
  equals: z.string().optional().nullable(),
  in: z.string().array().optional().nullable(),
  notIn: z.string().array().optional().nullable(),
  lt: z.string().optional(),
  lte: z.string().optional(),
  gt: z.string().optional(),
  gte: z.string().optional(),
  contains: z.string().optional(),
  startsWith: z.string().optional(),
  endsWith: z.string().optional(),
  mode: z.lazy(() => QueryModeSchema).optional(),
  not: z.union([ z.string(),z.lazy(() => NestedStringNullableWithAggregatesFilterSchema) ]).optional().nullable(),
  _count: z.lazy(() => NestedIntNullableFilterSchema).optional(),
  _min: z.lazy(() => NestedStringNullableFilterSchema).optional(),
  _max: z.lazy(() => NestedStringNullableFilterSchema).optional(),
});

export const IntWithAggregatesFilterSchema: z.ZodType<Prisma.IntWithAggregatesFilter> = z.strictObject({
  equals: z.number().optional(),
  in: z.number().array().optional(),
  notIn: z.number().array().optional(),
  lt: z.number().optional(),
  lte: z.number().optional(),
  gt: z.number().optional(),
  gte: z.number().optional(),
  not: z.union([ z.number(),z.lazy(() => NestedIntWithAggregatesFilterSchema) ]).optional(),
  _count: z.lazy(() => NestedIntFilterSchema).optional(),
  _avg: z.lazy(() => NestedFloatFilterSchema).optional(),
  _sum: z.lazy(() => NestedIntFilterSchema).optional(),
  _min: z.lazy(() => NestedIntFilterSchema).optional(),
  _max: z.lazy(() => NestedIntFilterSchema).optional(),
});

export const DateTimeNullableWithAggregatesFilterSchema: z.ZodType<Prisma.DateTimeNullableWithAggregatesFilter> = z.strictObject({
  equals: z.coerce.date().optional().nullable(),
  in: z.coerce.date().array().optional().nullable(),
  notIn: z.coerce.date().array().optional().nullable(),
  lt: z.coerce.date().optional(),
  lte: z.coerce.date().optional(),
  gt: z.coerce.date().optional(),
  gte: z.coerce.date().optional(),
  not: z.union([ z.coerce.date(),z.lazy(() => NestedDateTimeNullableWithAggregatesFilterSchema) ]).optional().nullable(),
  _count: z.lazy(() => NestedIntNullableFilterSchema).optional(),
  _min: z.lazy(() => NestedDateTimeNullableFilterSchema).optional(),
  _max: z.lazy(() => NestedDateTimeNullableFilterSchema).optional(),
});

export const BoolWithAggregatesFilterSchema: z.ZodType<Prisma.BoolWithAggregatesFilter> = z.strictObject({
  equals: z.boolean().optional(),
  not: z.union([ z.boolean(),z.lazy(() => NestedBoolWithAggregatesFilterSchema) ]).optional(),
  _count: z.lazy(() => NestedIntFilterSchema).optional(),
  _min: z.lazy(() => NestedBoolFilterSchema).optional(),
  _max: z.lazy(() => NestedBoolFilterSchema).optional(),
});

export const TaskScalarRelationFilterSchema: z.ZodType<Prisma.TaskScalarRelationFilter> = z.strictObject({
  is: z.lazy(() => TaskWhereInputSchema).optional(),
  isNot: z.lazy(() => TaskWhereInputSchema).optional(),
});

export const AttachmentCountOrderByAggregateInputSchema: z.ZodType<Prisma.AttachmentCountOrderByAggregateInput> = z.strictObject({
  id: z.lazy(() => SortOrderSchema).optional(),
  taskId: z.lazy(() => SortOrderSchema).optional(),
  name: z.lazy(() => SortOrderSchema).optional(),
  url: z.lazy(() => SortOrderSchema).optional(),
  type: z.lazy(() => SortOrderSchema).optional(),
  createdAt: z.lazy(() => SortOrderSchema).optional(),
});

export const AttachmentMaxOrderByAggregateInputSchema: z.ZodType<Prisma.AttachmentMaxOrderByAggregateInput> = z.strictObject({
  id: z.lazy(() => SortOrderSchema).optional(),
  taskId: z.lazy(() => SortOrderSchema).optional(),
  name: z.lazy(() => SortOrderSchema).optional(),
  url: z.lazy(() => SortOrderSchema).optional(),
  type: z.lazy(() => SortOrderSchema).optional(),
  createdAt: z.lazy(() => SortOrderSchema).optional(),
});

export const AttachmentMinOrderByAggregateInputSchema: z.ZodType<Prisma.AttachmentMinOrderByAggregateInput> = z.strictObject({
  id: z.lazy(() => SortOrderSchema).optional(),
  taskId: z.lazy(() => SortOrderSchema).optional(),
  name: z.lazy(() => SortOrderSchema).optional(),
  url: z.lazy(() => SortOrderSchema).optional(),
  type: z.lazy(() => SortOrderSchema).optional(),
  createdAt: z.lazy(() => SortOrderSchema).optional(),
});

export const TaskCreateNestedManyWithoutCourseInputSchema: z.ZodType<Prisma.TaskCreateNestedManyWithoutCourseInput> = z.strictObject({
  create: z.union([ z.lazy(() => TaskCreateWithoutCourseInputSchema), z.lazy(() => TaskCreateWithoutCourseInputSchema).array(), z.lazy(() => TaskUncheckedCreateWithoutCourseInputSchema), z.lazy(() => TaskUncheckedCreateWithoutCourseInputSchema).array() ]).optional(),
  connectOrCreate: z.union([ z.lazy(() => TaskCreateOrConnectWithoutCourseInputSchema), z.lazy(() => TaskCreateOrConnectWithoutCourseInputSchema).array() ]).optional(),
  createMany: z.lazy(() => TaskCreateManyCourseInputEnvelopeSchema).optional(),
  connect: z.union([ z.lazy(() => TaskWhereUniqueInputSchema), z.lazy(() => TaskWhereUniqueInputSchema).array() ]).optional(),
});

export const TaskUncheckedCreateNestedManyWithoutCourseInputSchema: z.ZodType<Prisma.TaskUncheckedCreateNestedManyWithoutCourseInput> = z.strictObject({
  create: z.union([ z.lazy(() => TaskCreateWithoutCourseInputSchema), z.lazy(() => TaskCreateWithoutCourseInputSchema).array(), z.lazy(() => TaskUncheckedCreateWithoutCourseInputSchema), z.lazy(() => TaskUncheckedCreateWithoutCourseInputSchema).array() ]).optional(),
  connectOrCreate: z.union([ z.lazy(() => TaskCreateOrConnectWithoutCourseInputSchema), z.lazy(() => TaskCreateOrConnectWithoutCourseInputSchema).array() ]).optional(),
  createMany: z.lazy(() => TaskCreateManyCourseInputEnvelopeSchema).optional(),
  connect: z.union([ z.lazy(() => TaskWhereUniqueInputSchema), z.lazy(() => TaskWhereUniqueInputSchema).array() ]).optional(),
});

export const StringFieldUpdateOperationsInputSchema: z.ZodType<Prisma.StringFieldUpdateOperationsInput> = z.strictObject({
  set: z.string().optional(),
});

export const DateTimeFieldUpdateOperationsInputSchema: z.ZodType<Prisma.DateTimeFieldUpdateOperationsInput> = z.strictObject({
  set: z.coerce.date().optional(),
});

export const TaskUpdateManyWithoutCourseNestedInputSchema: z.ZodType<Prisma.TaskUpdateManyWithoutCourseNestedInput> = z.strictObject({
  create: z.union([ z.lazy(() => TaskCreateWithoutCourseInputSchema), z.lazy(() => TaskCreateWithoutCourseInputSchema).array(), z.lazy(() => TaskUncheckedCreateWithoutCourseInputSchema), z.lazy(() => TaskUncheckedCreateWithoutCourseInputSchema).array() ]).optional(),
  connectOrCreate: z.union([ z.lazy(() => TaskCreateOrConnectWithoutCourseInputSchema), z.lazy(() => TaskCreateOrConnectWithoutCourseInputSchema).array() ]).optional(),
  upsert: z.union([ z.lazy(() => TaskUpsertWithWhereUniqueWithoutCourseInputSchema), z.lazy(() => TaskUpsertWithWhereUniqueWithoutCourseInputSchema).array() ]).optional(),
  createMany: z.lazy(() => TaskCreateManyCourseInputEnvelopeSchema).optional(),
  set: z.union([ z.lazy(() => TaskWhereUniqueInputSchema), z.lazy(() => TaskWhereUniqueInputSchema).array() ]).optional(),
  disconnect: z.union([ z.lazy(() => TaskWhereUniqueInputSchema), z.lazy(() => TaskWhereUniqueInputSchema).array() ]).optional(),
  delete: z.union([ z.lazy(() => TaskWhereUniqueInputSchema), z.lazy(() => TaskWhereUniqueInputSchema).array() ]).optional(),
  connect: z.union([ z.lazy(() => TaskWhereUniqueInputSchema), z.lazy(() => TaskWhereUniqueInputSchema).array() ]).optional(),
  update: z.union([ z.lazy(() => TaskUpdateWithWhereUniqueWithoutCourseInputSchema), z.lazy(() => TaskUpdateWithWhereUniqueWithoutCourseInputSchema).array() ]).optional(),
  updateMany: z.union([ z.lazy(() => TaskUpdateManyWithWhereWithoutCourseInputSchema), z.lazy(() => TaskUpdateManyWithWhereWithoutCourseInputSchema).array() ]).optional(),
  deleteMany: z.union([ z.lazy(() => TaskScalarWhereInputSchema), z.lazy(() => TaskScalarWhereInputSchema).array() ]).optional(),
});

export const TaskUncheckedUpdateManyWithoutCourseNestedInputSchema: z.ZodType<Prisma.TaskUncheckedUpdateManyWithoutCourseNestedInput> = z.strictObject({
  create: z.union([ z.lazy(() => TaskCreateWithoutCourseInputSchema), z.lazy(() => TaskCreateWithoutCourseInputSchema).array(), z.lazy(() => TaskUncheckedCreateWithoutCourseInputSchema), z.lazy(() => TaskUncheckedCreateWithoutCourseInputSchema).array() ]).optional(),
  connectOrCreate: z.union([ z.lazy(() => TaskCreateOrConnectWithoutCourseInputSchema), z.lazy(() => TaskCreateOrConnectWithoutCourseInputSchema).array() ]).optional(),
  upsert: z.union([ z.lazy(() => TaskUpsertWithWhereUniqueWithoutCourseInputSchema), z.lazy(() => TaskUpsertWithWhereUniqueWithoutCourseInputSchema).array() ]).optional(),
  createMany: z.lazy(() => TaskCreateManyCourseInputEnvelopeSchema).optional(),
  set: z.union([ z.lazy(() => TaskWhereUniqueInputSchema), z.lazy(() => TaskWhereUniqueInputSchema).array() ]).optional(),
  disconnect: z.union([ z.lazy(() => TaskWhereUniqueInputSchema), z.lazy(() => TaskWhereUniqueInputSchema).array() ]).optional(),
  delete: z.union([ z.lazy(() => TaskWhereUniqueInputSchema), z.lazy(() => TaskWhereUniqueInputSchema).array() ]).optional(),
  connect: z.union([ z.lazy(() => TaskWhereUniqueInputSchema), z.lazy(() => TaskWhereUniqueInputSchema).array() ]).optional(),
  update: z.union([ z.lazy(() => TaskUpdateWithWhereUniqueWithoutCourseInputSchema), z.lazy(() => TaskUpdateWithWhereUniqueWithoutCourseInputSchema).array() ]).optional(),
  updateMany: z.union([ z.lazy(() => TaskUpdateManyWithWhereWithoutCourseInputSchema), z.lazy(() => TaskUpdateManyWithWhereWithoutCourseInputSchema).array() ]).optional(),
  deleteMany: z.union([ z.lazy(() => TaskScalarWhereInputSchema), z.lazy(() => TaskScalarWhereInputSchema).array() ]).optional(),
});

export const CourseCreateNestedOneWithoutTasksInputSchema: z.ZodType<Prisma.CourseCreateNestedOneWithoutTasksInput> = z.strictObject({
  create: z.union([ z.lazy(() => CourseCreateWithoutTasksInputSchema), z.lazy(() => CourseUncheckedCreateWithoutTasksInputSchema) ]).optional(),
  connectOrCreate: z.lazy(() => CourseCreateOrConnectWithoutTasksInputSchema).optional(),
  connect: z.lazy(() => CourseWhereUniqueInputSchema).optional(),
});

export const TaskCreateNestedOneWithoutChildrenInputSchema: z.ZodType<Prisma.TaskCreateNestedOneWithoutChildrenInput> = z.strictObject({
  create: z.union([ z.lazy(() => TaskCreateWithoutChildrenInputSchema), z.lazy(() => TaskUncheckedCreateWithoutChildrenInputSchema) ]).optional(),
  connectOrCreate: z.lazy(() => TaskCreateOrConnectWithoutChildrenInputSchema).optional(),
  connect: z.lazy(() => TaskWhereUniqueInputSchema).optional(),
});

export const TaskCreateNestedManyWithoutParentInputSchema: z.ZodType<Prisma.TaskCreateNestedManyWithoutParentInput> = z.strictObject({
  create: z.union([ z.lazy(() => TaskCreateWithoutParentInputSchema), z.lazy(() => TaskCreateWithoutParentInputSchema).array(), z.lazy(() => TaskUncheckedCreateWithoutParentInputSchema), z.lazy(() => TaskUncheckedCreateWithoutParentInputSchema).array() ]).optional(),
  connectOrCreate: z.union([ z.lazy(() => TaskCreateOrConnectWithoutParentInputSchema), z.lazy(() => TaskCreateOrConnectWithoutParentInputSchema).array() ]).optional(),
  createMany: z.lazy(() => TaskCreateManyParentInputEnvelopeSchema).optional(),
  connect: z.union([ z.lazy(() => TaskWhereUniqueInputSchema), z.lazy(() => TaskWhereUniqueInputSchema).array() ]).optional(),
});

export const AttachmentCreateNestedManyWithoutTaskInputSchema: z.ZodType<Prisma.AttachmentCreateNestedManyWithoutTaskInput> = z.strictObject({
  create: z.union([ z.lazy(() => AttachmentCreateWithoutTaskInputSchema), z.lazy(() => AttachmentCreateWithoutTaskInputSchema).array(), z.lazy(() => AttachmentUncheckedCreateWithoutTaskInputSchema), z.lazy(() => AttachmentUncheckedCreateWithoutTaskInputSchema).array() ]).optional(),
  connectOrCreate: z.union([ z.lazy(() => AttachmentCreateOrConnectWithoutTaskInputSchema), z.lazy(() => AttachmentCreateOrConnectWithoutTaskInputSchema).array() ]).optional(),
  createMany: z.lazy(() => AttachmentCreateManyTaskInputEnvelopeSchema).optional(),
  connect: z.union([ z.lazy(() => AttachmentWhereUniqueInputSchema), z.lazy(() => AttachmentWhereUniqueInputSchema).array() ]).optional(),
});

export const TaskUncheckedCreateNestedManyWithoutParentInputSchema: z.ZodType<Prisma.TaskUncheckedCreateNestedManyWithoutParentInput> = z.strictObject({
  create: z.union([ z.lazy(() => TaskCreateWithoutParentInputSchema), z.lazy(() => TaskCreateWithoutParentInputSchema).array(), z.lazy(() => TaskUncheckedCreateWithoutParentInputSchema), z.lazy(() => TaskUncheckedCreateWithoutParentInputSchema).array() ]).optional(),
  connectOrCreate: z.union([ z.lazy(() => TaskCreateOrConnectWithoutParentInputSchema), z.lazy(() => TaskCreateOrConnectWithoutParentInputSchema).array() ]).optional(),
  createMany: z.lazy(() => TaskCreateManyParentInputEnvelopeSchema).optional(),
  connect: z.union([ z.lazy(() => TaskWhereUniqueInputSchema), z.lazy(() => TaskWhereUniqueInputSchema).array() ]).optional(),
});

export const AttachmentUncheckedCreateNestedManyWithoutTaskInputSchema: z.ZodType<Prisma.AttachmentUncheckedCreateNestedManyWithoutTaskInput> = z.strictObject({
  create: z.union([ z.lazy(() => AttachmentCreateWithoutTaskInputSchema), z.lazy(() => AttachmentCreateWithoutTaskInputSchema).array(), z.lazy(() => AttachmentUncheckedCreateWithoutTaskInputSchema), z.lazy(() => AttachmentUncheckedCreateWithoutTaskInputSchema).array() ]).optional(),
  connectOrCreate: z.union([ z.lazy(() => AttachmentCreateOrConnectWithoutTaskInputSchema), z.lazy(() => AttachmentCreateOrConnectWithoutTaskInputSchema).array() ]).optional(),
  createMany: z.lazy(() => AttachmentCreateManyTaskInputEnvelopeSchema).optional(),
  connect: z.union([ z.lazy(() => AttachmentWhereUniqueInputSchema), z.lazy(() => AttachmentWhereUniqueInputSchema).array() ]).optional(),
});

export const NullableStringFieldUpdateOperationsInputSchema: z.ZodType<Prisma.NullableStringFieldUpdateOperationsInput> = z.strictObject({
  set: z.string().optional().nullable(),
});

export const IntFieldUpdateOperationsInputSchema: z.ZodType<Prisma.IntFieldUpdateOperationsInput> = z.strictObject({
  set: z.number().optional(),
  increment: z.number().optional(),
  decrement: z.number().optional(),
  multiply: z.number().optional(),
  divide: z.number().optional(),
});

export const NullableDateTimeFieldUpdateOperationsInputSchema: z.ZodType<Prisma.NullableDateTimeFieldUpdateOperationsInput> = z.strictObject({
  set: z.coerce.date().optional().nullable(),
});

export const BoolFieldUpdateOperationsInputSchema: z.ZodType<Prisma.BoolFieldUpdateOperationsInput> = z.strictObject({
  set: z.boolean().optional(),
});

export const CourseUpdateOneWithoutTasksNestedInputSchema: z.ZodType<Prisma.CourseUpdateOneWithoutTasksNestedInput> = z.strictObject({
  create: z.union([ z.lazy(() => CourseCreateWithoutTasksInputSchema), z.lazy(() => CourseUncheckedCreateWithoutTasksInputSchema) ]).optional(),
  connectOrCreate: z.lazy(() => CourseCreateOrConnectWithoutTasksInputSchema).optional(),
  upsert: z.lazy(() => CourseUpsertWithoutTasksInputSchema).optional(),
  disconnect: z.union([ z.boolean(),z.lazy(() => CourseWhereInputSchema) ]).optional(),
  delete: z.union([ z.boolean(),z.lazy(() => CourseWhereInputSchema) ]).optional(),
  connect: z.lazy(() => CourseWhereUniqueInputSchema).optional(),
  update: z.union([ z.lazy(() => CourseUpdateToOneWithWhereWithoutTasksInputSchema), z.lazy(() => CourseUpdateWithoutTasksInputSchema), z.lazy(() => CourseUncheckedUpdateWithoutTasksInputSchema) ]).optional(),
});

export const TaskUpdateOneWithoutChildrenNestedInputSchema: z.ZodType<Prisma.TaskUpdateOneWithoutChildrenNestedInput> = z.strictObject({
  create: z.union([ z.lazy(() => TaskCreateWithoutChildrenInputSchema), z.lazy(() => TaskUncheckedCreateWithoutChildrenInputSchema) ]).optional(),
  connectOrCreate: z.lazy(() => TaskCreateOrConnectWithoutChildrenInputSchema).optional(),
  upsert: z.lazy(() => TaskUpsertWithoutChildrenInputSchema).optional(),
  disconnect: z.union([ z.boolean(),z.lazy(() => TaskWhereInputSchema) ]).optional(),
  delete: z.union([ z.boolean(),z.lazy(() => TaskWhereInputSchema) ]).optional(),
  connect: z.lazy(() => TaskWhereUniqueInputSchema).optional(),
  update: z.union([ z.lazy(() => TaskUpdateToOneWithWhereWithoutChildrenInputSchema), z.lazy(() => TaskUpdateWithoutChildrenInputSchema), z.lazy(() => TaskUncheckedUpdateWithoutChildrenInputSchema) ]).optional(),
});

export const TaskUpdateManyWithoutParentNestedInputSchema: z.ZodType<Prisma.TaskUpdateManyWithoutParentNestedInput> = z.strictObject({
  create: z.union([ z.lazy(() => TaskCreateWithoutParentInputSchema), z.lazy(() => TaskCreateWithoutParentInputSchema).array(), z.lazy(() => TaskUncheckedCreateWithoutParentInputSchema), z.lazy(() => TaskUncheckedCreateWithoutParentInputSchema).array() ]).optional(),
  connectOrCreate: z.union([ z.lazy(() => TaskCreateOrConnectWithoutParentInputSchema), z.lazy(() => TaskCreateOrConnectWithoutParentInputSchema).array() ]).optional(),
  upsert: z.union([ z.lazy(() => TaskUpsertWithWhereUniqueWithoutParentInputSchema), z.lazy(() => TaskUpsertWithWhereUniqueWithoutParentInputSchema).array() ]).optional(),
  createMany: z.lazy(() => TaskCreateManyParentInputEnvelopeSchema).optional(),
  set: z.union([ z.lazy(() => TaskWhereUniqueInputSchema), z.lazy(() => TaskWhereUniqueInputSchema).array() ]).optional(),
  disconnect: z.union([ z.lazy(() => TaskWhereUniqueInputSchema), z.lazy(() => TaskWhereUniqueInputSchema).array() ]).optional(),
  delete: z.union([ z.lazy(() => TaskWhereUniqueInputSchema), z.lazy(() => TaskWhereUniqueInputSchema).array() ]).optional(),
  connect: z.union([ z.lazy(() => TaskWhereUniqueInputSchema), z.lazy(() => TaskWhereUniqueInputSchema).array() ]).optional(),
  update: z.union([ z.lazy(() => TaskUpdateWithWhereUniqueWithoutParentInputSchema), z.lazy(() => TaskUpdateWithWhereUniqueWithoutParentInputSchema).array() ]).optional(),
  updateMany: z.union([ z.lazy(() => TaskUpdateManyWithWhereWithoutParentInputSchema), z.lazy(() => TaskUpdateManyWithWhereWithoutParentInputSchema).array() ]).optional(),
  deleteMany: z.union([ z.lazy(() => TaskScalarWhereInputSchema), z.lazy(() => TaskScalarWhereInputSchema).array() ]).optional(),
});

export const AttachmentUpdateManyWithoutTaskNestedInputSchema: z.ZodType<Prisma.AttachmentUpdateManyWithoutTaskNestedInput> = z.strictObject({
  create: z.union([ z.lazy(() => AttachmentCreateWithoutTaskInputSchema), z.lazy(() => AttachmentCreateWithoutTaskInputSchema).array(), z.lazy(() => AttachmentUncheckedCreateWithoutTaskInputSchema), z.lazy(() => AttachmentUncheckedCreateWithoutTaskInputSchema).array() ]).optional(),
  connectOrCreate: z.union([ z.lazy(() => AttachmentCreateOrConnectWithoutTaskInputSchema), z.lazy(() => AttachmentCreateOrConnectWithoutTaskInputSchema).array() ]).optional(),
  upsert: z.union([ z.lazy(() => AttachmentUpsertWithWhereUniqueWithoutTaskInputSchema), z.lazy(() => AttachmentUpsertWithWhereUniqueWithoutTaskInputSchema).array() ]).optional(),
  createMany: z.lazy(() => AttachmentCreateManyTaskInputEnvelopeSchema).optional(),
  set: z.union([ z.lazy(() => AttachmentWhereUniqueInputSchema), z.lazy(() => AttachmentWhereUniqueInputSchema).array() ]).optional(),
  disconnect: z.union([ z.lazy(() => AttachmentWhereUniqueInputSchema), z.lazy(() => AttachmentWhereUniqueInputSchema).array() ]).optional(),
  delete: z.union([ z.lazy(() => AttachmentWhereUniqueInputSchema), z.lazy(() => AttachmentWhereUniqueInputSchema).array() ]).optional(),
  connect: z.union([ z.lazy(() => AttachmentWhereUniqueInputSchema), z.lazy(() => AttachmentWhereUniqueInputSchema).array() ]).optional(),
  update: z.union([ z.lazy(() => AttachmentUpdateWithWhereUniqueWithoutTaskInputSchema), z.lazy(() => AttachmentUpdateWithWhereUniqueWithoutTaskInputSchema).array() ]).optional(),
  updateMany: z.union([ z.lazy(() => AttachmentUpdateManyWithWhereWithoutTaskInputSchema), z.lazy(() => AttachmentUpdateManyWithWhereWithoutTaskInputSchema).array() ]).optional(),
  deleteMany: z.union([ z.lazy(() => AttachmentScalarWhereInputSchema), z.lazy(() => AttachmentScalarWhereInputSchema).array() ]).optional(),
});

export const TaskUncheckedUpdateManyWithoutParentNestedInputSchema: z.ZodType<Prisma.TaskUncheckedUpdateManyWithoutParentNestedInput> = z.strictObject({
  create: z.union([ z.lazy(() => TaskCreateWithoutParentInputSchema), z.lazy(() => TaskCreateWithoutParentInputSchema).array(), z.lazy(() => TaskUncheckedCreateWithoutParentInputSchema), z.lazy(() => TaskUncheckedCreateWithoutParentInputSchema).array() ]).optional(),
  connectOrCreate: z.union([ z.lazy(() => TaskCreateOrConnectWithoutParentInputSchema), z.lazy(() => TaskCreateOrConnectWithoutParentInputSchema).array() ]).optional(),
  upsert: z.union([ z.lazy(() => TaskUpsertWithWhereUniqueWithoutParentInputSchema), z.lazy(() => TaskUpsertWithWhereUniqueWithoutParentInputSchema).array() ]).optional(),
  createMany: z.lazy(() => TaskCreateManyParentInputEnvelopeSchema).optional(),
  set: z.union([ z.lazy(() => TaskWhereUniqueInputSchema), z.lazy(() => TaskWhereUniqueInputSchema).array() ]).optional(),
  disconnect: z.union([ z.lazy(() => TaskWhereUniqueInputSchema), z.lazy(() => TaskWhereUniqueInputSchema).array() ]).optional(),
  delete: z.union([ z.lazy(() => TaskWhereUniqueInputSchema), z.lazy(() => TaskWhereUniqueInputSchema).array() ]).optional(),
  connect: z.union([ z.lazy(() => TaskWhereUniqueInputSchema), z.lazy(() => TaskWhereUniqueInputSchema).array() ]).optional(),
  update: z.union([ z.lazy(() => TaskUpdateWithWhereUniqueWithoutParentInputSchema), z.lazy(() => TaskUpdateWithWhereUniqueWithoutParentInputSchema).array() ]).optional(),
  updateMany: z.union([ z.lazy(() => TaskUpdateManyWithWhereWithoutParentInputSchema), z.lazy(() => TaskUpdateManyWithWhereWithoutParentInputSchema).array() ]).optional(),
  deleteMany: z.union([ z.lazy(() => TaskScalarWhereInputSchema), z.lazy(() => TaskScalarWhereInputSchema).array() ]).optional(),
});

export const AttachmentUncheckedUpdateManyWithoutTaskNestedInputSchema: z.ZodType<Prisma.AttachmentUncheckedUpdateManyWithoutTaskNestedInput> = z.strictObject({
  create: z.union([ z.lazy(() => AttachmentCreateWithoutTaskInputSchema), z.lazy(() => AttachmentCreateWithoutTaskInputSchema).array(), z.lazy(() => AttachmentUncheckedCreateWithoutTaskInputSchema), z.lazy(() => AttachmentUncheckedCreateWithoutTaskInputSchema).array() ]).optional(),
  connectOrCreate: z.union([ z.lazy(() => AttachmentCreateOrConnectWithoutTaskInputSchema), z.lazy(() => AttachmentCreateOrConnectWithoutTaskInputSchema).array() ]).optional(),
  upsert: z.union([ z.lazy(() => AttachmentUpsertWithWhereUniqueWithoutTaskInputSchema), z.lazy(() => AttachmentUpsertWithWhereUniqueWithoutTaskInputSchema).array() ]).optional(),
  createMany: z.lazy(() => AttachmentCreateManyTaskInputEnvelopeSchema).optional(),
  set: z.union([ z.lazy(() => AttachmentWhereUniqueInputSchema), z.lazy(() => AttachmentWhereUniqueInputSchema).array() ]).optional(),
  disconnect: z.union([ z.lazy(() => AttachmentWhereUniqueInputSchema), z.lazy(() => AttachmentWhereUniqueInputSchema).array() ]).optional(),
  delete: z.union([ z.lazy(() => AttachmentWhereUniqueInputSchema), z.lazy(() => AttachmentWhereUniqueInputSchema).array() ]).optional(),
  connect: z.union([ z.lazy(() => AttachmentWhereUniqueInputSchema), z.lazy(() => AttachmentWhereUniqueInputSchema).array() ]).optional(),
  update: z.union([ z.lazy(() => AttachmentUpdateWithWhereUniqueWithoutTaskInputSchema), z.lazy(() => AttachmentUpdateWithWhereUniqueWithoutTaskInputSchema).array() ]).optional(),
  updateMany: z.union([ z.lazy(() => AttachmentUpdateManyWithWhereWithoutTaskInputSchema), z.lazy(() => AttachmentUpdateManyWithWhereWithoutTaskInputSchema).array() ]).optional(),
  deleteMany: z.union([ z.lazy(() => AttachmentScalarWhereInputSchema), z.lazy(() => AttachmentScalarWhereInputSchema).array() ]).optional(),
});

export const TaskCreateNestedOneWithoutAttachmentsInputSchema: z.ZodType<Prisma.TaskCreateNestedOneWithoutAttachmentsInput> = z.strictObject({
  create: z.union([ z.lazy(() => TaskCreateWithoutAttachmentsInputSchema), z.lazy(() => TaskUncheckedCreateWithoutAttachmentsInputSchema) ]).optional(),
  connectOrCreate: z.lazy(() => TaskCreateOrConnectWithoutAttachmentsInputSchema).optional(),
  connect: z.lazy(() => TaskWhereUniqueInputSchema).optional(),
});

export const TaskUpdateOneRequiredWithoutAttachmentsNestedInputSchema: z.ZodType<Prisma.TaskUpdateOneRequiredWithoutAttachmentsNestedInput> = z.strictObject({
  create: z.union([ z.lazy(() => TaskCreateWithoutAttachmentsInputSchema), z.lazy(() => TaskUncheckedCreateWithoutAttachmentsInputSchema) ]).optional(),
  connectOrCreate: z.lazy(() => TaskCreateOrConnectWithoutAttachmentsInputSchema).optional(),
  upsert: z.lazy(() => TaskUpsertWithoutAttachmentsInputSchema).optional(),
  connect: z.lazy(() => TaskWhereUniqueInputSchema).optional(),
  update: z.union([ z.lazy(() => TaskUpdateToOneWithWhereWithoutAttachmentsInputSchema), z.lazy(() => TaskUpdateWithoutAttachmentsInputSchema), z.lazy(() => TaskUncheckedUpdateWithoutAttachmentsInputSchema) ]).optional(),
});

export const NestedStringFilterSchema: z.ZodType<Prisma.NestedStringFilter> = z.strictObject({
  equals: z.string().optional(),
  in: z.string().array().optional(),
  notIn: z.string().array().optional(),
  lt: z.string().optional(),
  lte: z.string().optional(),
  gt: z.string().optional(),
  gte: z.string().optional(),
  contains: z.string().optional(),
  startsWith: z.string().optional(),
  endsWith: z.string().optional(),
  not: z.union([ z.string(),z.lazy(() => NestedStringFilterSchema) ]).optional(),
});

export const NestedDateTimeFilterSchema: z.ZodType<Prisma.NestedDateTimeFilter> = z.strictObject({
  equals: z.coerce.date().optional(),
  in: z.coerce.date().array().optional(),
  notIn: z.coerce.date().array().optional(),
  lt: z.coerce.date().optional(),
  lte: z.coerce.date().optional(),
  gt: z.coerce.date().optional(),
  gte: z.coerce.date().optional(),
  not: z.union([ z.coerce.date(),z.lazy(() => NestedDateTimeFilterSchema) ]).optional(),
});

export const NestedStringWithAggregatesFilterSchema: z.ZodType<Prisma.NestedStringWithAggregatesFilter> = z.strictObject({
  equals: z.string().optional(),
  in: z.string().array().optional(),
  notIn: z.string().array().optional(),
  lt: z.string().optional(),
  lte: z.string().optional(),
  gt: z.string().optional(),
  gte: z.string().optional(),
  contains: z.string().optional(),
  startsWith: z.string().optional(),
  endsWith: z.string().optional(),
  not: z.union([ z.string(),z.lazy(() => NestedStringWithAggregatesFilterSchema) ]).optional(),
  _count: z.lazy(() => NestedIntFilterSchema).optional(),
  _min: z.lazy(() => NestedStringFilterSchema).optional(),
  _max: z.lazy(() => NestedStringFilterSchema).optional(),
});

export const NestedIntFilterSchema: z.ZodType<Prisma.NestedIntFilter> = z.strictObject({
  equals: z.number().optional(),
  in: z.number().array().optional(),
  notIn: z.number().array().optional(),
  lt: z.number().optional(),
  lte: z.number().optional(),
  gt: z.number().optional(),
  gte: z.number().optional(),
  not: z.union([ z.number(),z.lazy(() => NestedIntFilterSchema) ]).optional(),
});

export const NestedIntNullableFilterSchema: z.ZodType<Prisma.NestedIntNullableFilter> = z.strictObject({
  equals: z.number().optional().nullable(),
  in: z.number().array().optional().nullable(),
  notIn: z.number().array().optional().nullable(),
  lt: z.number().optional(),
  lte: z.number().optional(),
  gt: z.number().optional(),
  gte: z.number().optional(),
  not: z.union([ z.number(),z.lazy(() => NestedIntNullableFilterSchema) ]).optional().nullable(),
});

export const NestedJsonNullableFilterSchema: z.ZodType<Prisma.NestedJsonNullableFilter> = z.strictObject({
  equals: InputJsonValueSchema.optional(),
  path: z.string().array().optional(),
  mode: z.lazy(() => QueryModeSchema).optional(),
  string_contains: z.string().optional(),
  string_starts_with: z.string().optional(),
  string_ends_with: z.string().optional(),
  array_starts_with: InputJsonValueSchema.optional().nullable(),
  array_ends_with: InputJsonValueSchema.optional().nullable(),
  array_contains: InputJsonValueSchema.optional().nullable(),
  lt: InputJsonValueSchema.optional(),
  lte: InputJsonValueSchema.optional(),
  gt: InputJsonValueSchema.optional(),
  gte: InputJsonValueSchema.optional(),
  not: InputJsonValueSchema.optional(),
});

export const NestedDateTimeWithAggregatesFilterSchema: z.ZodType<Prisma.NestedDateTimeWithAggregatesFilter> = z.strictObject({
  equals: z.coerce.date().optional(),
  in: z.coerce.date().array().optional(),
  notIn: z.coerce.date().array().optional(),
  lt: z.coerce.date().optional(),
  lte: z.coerce.date().optional(),
  gt: z.coerce.date().optional(),
  gte: z.coerce.date().optional(),
  not: z.union([ z.coerce.date(),z.lazy(() => NestedDateTimeWithAggregatesFilterSchema) ]).optional(),
  _count: z.lazy(() => NestedIntFilterSchema).optional(),
  _min: z.lazy(() => NestedDateTimeFilterSchema).optional(),
  _max: z.lazy(() => NestedDateTimeFilterSchema).optional(),
});

export const NestedStringNullableFilterSchema: z.ZodType<Prisma.NestedStringNullableFilter> = z.strictObject({
  equals: z.string().optional().nullable(),
  in: z.string().array().optional().nullable(),
  notIn: z.string().array().optional().nullable(),
  lt: z.string().optional(),
  lte: z.string().optional(),
  gt: z.string().optional(),
  gte: z.string().optional(),
  contains: z.string().optional(),
  startsWith: z.string().optional(),
  endsWith: z.string().optional(),
  not: z.union([ z.string(),z.lazy(() => NestedStringNullableFilterSchema) ]).optional().nullable(),
});

export const NestedDateTimeNullableFilterSchema: z.ZodType<Prisma.NestedDateTimeNullableFilter> = z.strictObject({
  equals: z.coerce.date().optional().nullable(),
  in: z.coerce.date().array().optional().nullable(),
  notIn: z.coerce.date().array().optional().nullable(),
  lt: z.coerce.date().optional(),
  lte: z.coerce.date().optional(),
  gt: z.coerce.date().optional(),
  gte: z.coerce.date().optional(),
  not: z.union([ z.coerce.date(),z.lazy(() => NestedDateTimeNullableFilterSchema) ]).optional().nullable(),
});

export const NestedBoolFilterSchema: z.ZodType<Prisma.NestedBoolFilter> = z.strictObject({
  equals: z.boolean().optional(),
  not: z.union([ z.boolean(),z.lazy(() => NestedBoolFilterSchema) ]).optional(),
});

export const NestedStringNullableWithAggregatesFilterSchema: z.ZodType<Prisma.NestedStringNullableWithAggregatesFilter> = z.strictObject({
  equals: z.string().optional().nullable(),
  in: z.string().array().optional().nullable(),
  notIn: z.string().array().optional().nullable(),
  lt: z.string().optional(),
  lte: z.string().optional(),
  gt: z.string().optional(),
  gte: z.string().optional(),
  contains: z.string().optional(),
  startsWith: z.string().optional(),
  endsWith: z.string().optional(),
  not: z.union([ z.string(),z.lazy(() => NestedStringNullableWithAggregatesFilterSchema) ]).optional().nullable(),
  _count: z.lazy(() => NestedIntNullableFilterSchema).optional(),
  _min: z.lazy(() => NestedStringNullableFilterSchema).optional(),
  _max: z.lazy(() => NestedStringNullableFilterSchema).optional(),
});

export const NestedIntWithAggregatesFilterSchema: z.ZodType<Prisma.NestedIntWithAggregatesFilter> = z.strictObject({
  equals: z.number().optional(),
  in: z.number().array().optional(),
  notIn: z.number().array().optional(),
  lt: z.number().optional(),
  lte: z.number().optional(),
  gt: z.number().optional(),
  gte: z.number().optional(),
  not: z.union([ z.number(),z.lazy(() => NestedIntWithAggregatesFilterSchema) ]).optional(),
  _count: z.lazy(() => NestedIntFilterSchema).optional(),
  _avg: z.lazy(() => NestedFloatFilterSchema).optional(),
  _sum: z.lazy(() => NestedIntFilterSchema).optional(),
  _min: z.lazy(() => NestedIntFilterSchema).optional(),
  _max: z.lazy(() => NestedIntFilterSchema).optional(),
});

export const NestedFloatFilterSchema: z.ZodType<Prisma.NestedFloatFilter> = z.strictObject({
  equals: z.number().optional(),
  in: z.number().array().optional(),
  notIn: z.number().array().optional(),
  lt: z.number().optional(),
  lte: z.number().optional(),
  gt: z.number().optional(),
  gte: z.number().optional(),
  not: z.union([ z.number(),z.lazy(() => NestedFloatFilterSchema) ]).optional(),
});

export const NestedDateTimeNullableWithAggregatesFilterSchema: z.ZodType<Prisma.NestedDateTimeNullableWithAggregatesFilter> = z.strictObject({
  equals: z.coerce.date().optional().nullable(),
  in: z.coerce.date().array().optional().nullable(),
  notIn: z.coerce.date().array().optional().nullable(),
  lt: z.coerce.date().optional(),
  lte: z.coerce.date().optional(),
  gt: z.coerce.date().optional(),
  gte: z.coerce.date().optional(),
  not: z.union([ z.coerce.date(),z.lazy(() => NestedDateTimeNullableWithAggregatesFilterSchema) ]).optional().nullable(),
  _count: z.lazy(() => NestedIntNullableFilterSchema).optional(),
  _min: z.lazy(() => NestedDateTimeNullableFilterSchema).optional(),
  _max: z.lazy(() => NestedDateTimeNullableFilterSchema).optional(),
});

export const NestedBoolWithAggregatesFilterSchema: z.ZodType<Prisma.NestedBoolWithAggregatesFilter> = z.strictObject({
  equals: z.boolean().optional(),
  not: z.union([ z.boolean(),z.lazy(() => NestedBoolWithAggregatesFilterSchema) ]).optional(),
  _count: z.lazy(() => NestedIntFilterSchema).optional(),
  _min: z.lazy(() => NestedBoolFilterSchema).optional(),
  _max: z.lazy(() => NestedBoolFilterSchema).optional(),
});

export const TaskCreateWithoutCourseInputSchema: z.ZodType<Prisma.TaskCreateWithoutCourseInput> = z.strictObject({
  id: z.uuid().optional(),
  userId: z.string(),
  title: z.string(),
  description: z.string().optional().nullable(),
  importance: z.number().int().optional(),
  weight: z.number().int().optional(),
  deadline: z.coerce.date().optional().nullable(),
  position: z.number().int().optional(),
  type: z.string().optional(),
  isCompleted: z.boolean().optional(),
  estimatedPomodoros: z.number().int().optional(),
  createdAt: z.coerce.date().optional(),
  updatedAt: z.coerce.date().optional(),
  parent: z.lazy(() => TaskCreateNestedOneWithoutChildrenInputSchema).optional(),
  children: z.lazy(() => TaskCreateNestedManyWithoutParentInputSchema).optional(),
  attachments: z.lazy(() => AttachmentCreateNestedManyWithoutTaskInputSchema).optional(),
});

export const TaskUncheckedCreateWithoutCourseInputSchema: z.ZodType<Prisma.TaskUncheckedCreateWithoutCourseInput> = z.strictObject({
  id: z.uuid().optional(),
  userId: z.string(),
  title: z.string(),
  description: z.string().optional().nullable(),
  importance: z.number().int().optional(),
  weight: z.number().int().optional(),
  deadline: z.coerce.date().optional().nullable(),
  position: z.number().int().optional(),
  type: z.string().optional(),
  isCompleted: z.boolean().optional(),
  estimatedPomodoros: z.number().int().optional(),
  parentId: z.string().optional().nullable(),
  createdAt: z.coerce.date().optional(),
  updatedAt: z.coerce.date().optional(),
  children: z.lazy(() => TaskUncheckedCreateNestedManyWithoutParentInputSchema).optional(),
  attachments: z.lazy(() => AttachmentUncheckedCreateNestedManyWithoutTaskInputSchema).optional(),
});

export const TaskCreateOrConnectWithoutCourseInputSchema: z.ZodType<Prisma.TaskCreateOrConnectWithoutCourseInput> = z.strictObject({
  where: z.lazy(() => TaskWhereUniqueInputSchema),
  create: z.union([ z.lazy(() => TaskCreateWithoutCourseInputSchema), z.lazy(() => TaskUncheckedCreateWithoutCourseInputSchema) ]),
});

export const TaskCreateManyCourseInputEnvelopeSchema: z.ZodType<Prisma.TaskCreateManyCourseInputEnvelope> = z.strictObject({
  data: z.union([ z.lazy(() => TaskCreateManyCourseInputSchema), z.lazy(() => TaskCreateManyCourseInputSchema).array() ]),
  skipDuplicates: z.boolean().optional(),
});

export const TaskUpsertWithWhereUniqueWithoutCourseInputSchema: z.ZodType<Prisma.TaskUpsertWithWhereUniqueWithoutCourseInput> = z.strictObject({
  where: z.lazy(() => TaskWhereUniqueInputSchema),
  update: z.union([ z.lazy(() => TaskUpdateWithoutCourseInputSchema), z.lazy(() => TaskUncheckedUpdateWithoutCourseInputSchema) ]),
  create: z.union([ z.lazy(() => TaskCreateWithoutCourseInputSchema), z.lazy(() => TaskUncheckedCreateWithoutCourseInputSchema) ]),
});

export const TaskUpdateWithWhereUniqueWithoutCourseInputSchema: z.ZodType<Prisma.TaskUpdateWithWhereUniqueWithoutCourseInput> = z.strictObject({
  where: z.lazy(() => TaskWhereUniqueInputSchema),
  data: z.union([ z.lazy(() => TaskUpdateWithoutCourseInputSchema), z.lazy(() => TaskUncheckedUpdateWithoutCourseInputSchema) ]),
});

export const TaskUpdateManyWithWhereWithoutCourseInputSchema: z.ZodType<Prisma.TaskUpdateManyWithWhereWithoutCourseInput> = z.strictObject({
  where: z.lazy(() => TaskScalarWhereInputSchema),
  data: z.union([ z.lazy(() => TaskUpdateManyMutationInputSchema), z.lazy(() => TaskUncheckedUpdateManyWithoutCourseInputSchema) ]),
});

export const TaskScalarWhereInputSchema: z.ZodType<Prisma.TaskScalarWhereInput> = z.strictObject({
  AND: z.union([ z.lazy(() => TaskScalarWhereInputSchema), z.lazy(() => TaskScalarWhereInputSchema).array() ]).optional(),
  OR: z.lazy(() => TaskScalarWhereInputSchema).array().optional(),
  NOT: z.union([ z.lazy(() => TaskScalarWhereInputSchema), z.lazy(() => TaskScalarWhereInputSchema).array() ]).optional(),
  id: z.union([ z.lazy(() => StringFilterSchema), z.string() ]).optional(),
  userId: z.union([ z.lazy(() => StringFilterSchema), z.string() ]).optional(),
  title: z.union([ z.lazy(() => StringFilterSchema), z.string() ]).optional(),
  description: z.union([ z.lazy(() => StringNullableFilterSchema), z.string() ]).optional().nullable(),
  importance: z.union([ z.lazy(() => IntFilterSchema), z.number() ]).optional(),
  weight: z.union([ z.lazy(() => IntFilterSchema), z.number() ]).optional(),
  deadline: z.union([ z.lazy(() => DateTimeNullableFilterSchema), z.coerce.date() ]).optional().nullable(),
  position: z.union([ z.lazy(() => IntFilterSchema), z.number() ]).optional(),
  type: z.union([ z.lazy(() => StringFilterSchema), z.string() ]).optional(),
  isCompleted: z.union([ z.lazy(() => BoolFilterSchema), z.boolean() ]).optional(),
  estimatedPomodoros: z.union([ z.lazy(() => IntFilterSchema), z.number() ]).optional(),
  courseId: z.union([ z.lazy(() => StringNullableFilterSchema), z.string() ]).optional().nullable(),
  parentId: z.union([ z.lazy(() => StringNullableFilterSchema), z.string() ]).optional().nullable(),
  createdAt: z.union([ z.lazy(() => DateTimeFilterSchema), z.coerce.date() ]).optional(),
  updatedAt: z.union([ z.lazy(() => DateTimeFilterSchema), z.coerce.date() ]).optional(),
});

export const CourseCreateWithoutTasksInputSchema: z.ZodType<Prisma.CourseCreateWithoutTasksInput> = z.strictObject({
  id: z.uuid().optional(),
  userId: z.string(),
  name: z.string(),
  rubric: z.union([ z.lazy(() => NullableJsonNullValueInputSchema), InputJsonValueSchema ]).optional(),
  createdAt: z.coerce.date().optional(),
  updatedAt: z.coerce.date().optional(),
});

export const CourseUncheckedCreateWithoutTasksInputSchema: z.ZodType<Prisma.CourseUncheckedCreateWithoutTasksInput> = z.strictObject({
  id: z.uuid().optional(),
  userId: z.string(),
  name: z.string(),
  rubric: z.union([ z.lazy(() => NullableJsonNullValueInputSchema), InputJsonValueSchema ]).optional(),
  createdAt: z.coerce.date().optional(),
  updatedAt: z.coerce.date().optional(),
});

export const CourseCreateOrConnectWithoutTasksInputSchema: z.ZodType<Prisma.CourseCreateOrConnectWithoutTasksInput> = z.strictObject({
  where: z.lazy(() => CourseWhereUniqueInputSchema),
  create: z.union([ z.lazy(() => CourseCreateWithoutTasksInputSchema), z.lazy(() => CourseUncheckedCreateWithoutTasksInputSchema) ]),
});

export const TaskCreateWithoutChildrenInputSchema: z.ZodType<Prisma.TaskCreateWithoutChildrenInput> = z.strictObject({
  id: z.uuid().optional(),
  userId: z.string(),
  title: z.string(),
  description: z.string().optional().nullable(),
  importance: z.number().int().optional(),
  weight: z.number().int().optional(),
  deadline: z.coerce.date().optional().nullable(),
  position: z.number().int().optional(),
  type: z.string().optional(),
  isCompleted: z.boolean().optional(),
  estimatedPomodoros: z.number().int().optional(),
  createdAt: z.coerce.date().optional(),
  updatedAt: z.coerce.date().optional(),
  course: z.lazy(() => CourseCreateNestedOneWithoutTasksInputSchema).optional(),
  parent: z.lazy(() => TaskCreateNestedOneWithoutChildrenInputSchema).optional(),
  attachments: z.lazy(() => AttachmentCreateNestedManyWithoutTaskInputSchema).optional(),
});

export const TaskUncheckedCreateWithoutChildrenInputSchema: z.ZodType<Prisma.TaskUncheckedCreateWithoutChildrenInput> = z.strictObject({
  id: z.uuid().optional(),
  userId: z.string(),
  title: z.string(),
  description: z.string().optional().nullable(),
  importance: z.number().int().optional(),
  weight: z.number().int().optional(),
  deadline: z.coerce.date().optional().nullable(),
  position: z.number().int().optional(),
  type: z.string().optional(),
  isCompleted: z.boolean().optional(),
  estimatedPomodoros: z.number().int().optional(),
  courseId: z.string().optional().nullable(),
  parentId: z.string().optional().nullable(),
  createdAt: z.coerce.date().optional(),
  updatedAt: z.coerce.date().optional(),
  attachments: z.lazy(() => AttachmentUncheckedCreateNestedManyWithoutTaskInputSchema).optional(),
});

export const TaskCreateOrConnectWithoutChildrenInputSchema: z.ZodType<Prisma.TaskCreateOrConnectWithoutChildrenInput> = z.strictObject({
  where: z.lazy(() => TaskWhereUniqueInputSchema),
  create: z.union([ z.lazy(() => TaskCreateWithoutChildrenInputSchema), z.lazy(() => TaskUncheckedCreateWithoutChildrenInputSchema) ]),
});

export const TaskCreateWithoutParentInputSchema: z.ZodType<Prisma.TaskCreateWithoutParentInput> = z.strictObject({
  id: z.uuid().optional(),
  userId: z.string(),
  title: z.string(),
  description: z.string().optional().nullable(),
  importance: z.number().int().optional(),
  weight: z.number().int().optional(),
  deadline: z.coerce.date().optional().nullable(),
  position: z.number().int().optional(),
  type: z.string().optional(),
  isCompleted: z.boolean().optional(),
  estimatedPomodoros: z.number().int().optional(),
  createdAt: z.coerce.date().optional(),
  updatedAt: z.coerce.date().optional(),
  course: z.lazy(() => CourseCreateNestedOneWithoutTasksInputSchema).optional(),
  children: z.lazy(() => TaskCreateNestedManyWithoutParentInputSchema).optional(),
  attachments: z.lazy(() => AttachmentCreateNestedManyWithoutTaskInputSchema).optional(),
});

export const TaskUncheckedCreateWithoutParentInputSchema: z.ZodType<Prisma.TaskUncheckedCreateWithoutParentInput> = z.strictObject({
  id: z.uuid().optional(),
  userId: z.string(),
  title: z.string(),
  description: z.string().optional().nullable(),
  importance: z.number().int().optional(),
  weight: z.number().int().optional(),
  deadline: z.coerce.date().optional().nullable(),
  position: z.number().int().optional(),
  type: z.string().optional(),
  isCompleted: z.boolean().optional(),
  estimatedPomodoros: z.number().int().optional(),
  courseId: z.string().optional().nullable(),
  createdAt: z.coerce.date().optional(),
  updatedAt: z.coerce.date().optional(),
  children: z.lazy(() => TaskUncheckedCreateNestedManyWithoutParentInputSchema).optional(),
  attachments: z.lazy(() => AttachmentUncheckedCreateNestedManyWithoutTaskInputSchema).optional(),
});

export const TaskCreateOrConnectWithoutParentInputSchema: z.ZodType<Prisma.TaskCreateOrConnectWithoutParentInput> = z.strictObject({
  where: z.lazy(() => TaskWhereUniqueInputSchema),
  create: z.union([ z.lazy(() => TaskCreateWithoutParentInputSchema), z.lazy(() => TaskUncheckedCreateWithoutParentInputSchema) ]),
});

export const TaskCreateManyParentInputEnvelopeSchema: z.ZodType<Prisma.TaskCreateManyParentInputEnvelope> = z.strictObject({
  data: z.union([ z.lazy(() => TaskCreateManyParentInputSchema), z.lazy(() => TaskCreateManyParentInputSchema).array() ]),
  skipDuplicates: z.boolean().optional(),
});

export const AttachmentCreateWithoutTaskInputSchema: z.ZodType<Prisma.AttachmentCreateWithoutTaskInput> = z.strictObject({
  id: z.uuid().optional(),
  name: z.string(),
  url: z.string(),
  type: z.string(),
  createdAt: z.coerce.date().optional(),
});

export const AttachmentUncheckedCreateWithoutTaskInputSchema: z.ZodType<Prisma.AttachmentUncheckedCreateWithoutTaskInput> = z.strictObject({
  id: z.uuid().optional(),
  name: z.string(),
  url: z.string(),
  type: z.string(),
  createdAt: z.coerce.date().optional(),
});

export const AttachmentCreateOrConnectWithoutTaskInputSchema: z.ZodType<Prisma.AttachmentCreateOrConnectWithoutTaskInput> = z.strictObject({
  where: z.lazy(() => AttachmentWhereUniqueInputSchema),
  create: z.union([ z.lazy(() => AttachmentCreateWithoutTaskInputSchema), z.lazy(() => AttachmentUncheckedCreateWithoutTaskInputSchema) ]),
});

export const AttachmentCreateManyTaskInputEnvelopeSchema: z.ZodType<Prisma.AttachmentCreateManyTaskInputEnvelope> = z.strictObject({
  data: z.union([ z.lazy(() => AttachmentCreateManyTaskInputSchema), z.lazy(() => AttachmentCreateManyTaskInputSchema).array() ]),
  skipDuplicates: z.boolean().optional(),
});

export const CourseUpsertWithoutTasksInputSchema: z.ZodType<Prisma.CourseUpsertWithoutTasksInput> = z.strictObject({
  update: z.union([ z.lazy(() => CourseUpdateWithoutTasksInputSchema), z.lazy(() => CourseUncheckedUpdateWithoutTasksInputSchema) ]),
  create: z.union([ z.lazy(() => CourseCreateWithoutTasksInputSchema), z.lazy(() => CourseUncheckedCreateWithoutTasksInputSchema) ]),
  where: z.lazy(() => CourseWhereInputSchema).optional(),
});

export const CourseUpdateToOneWithWhereWithoutTasksInputSchema: z.ZodType<Prisma.CourseUpdateToOneWithWhereWithoutTasksInput> = z.strictObject({
  where: z.lazy(() => CourseWhereInputSchema).optional(),
  data: z.union([ z.lazy(() => CourseUpdateWithoutTasksInputSchema), z.lazy(() => CourseUncheckedUpdateWithoutTasksInputSchema) ]),
});

export const CourseUpdateWithoutTasksInputSchema: z.ZodType<Prisma.CourseUpdateWithoutTasksInput> = z.strictObject({
  id: z.union([ z.uuid(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  userId: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  name: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  rubric: z.union([ z.lazy(() => NullableJsonNullValueInputSchema), InputJsonValueSchema ]).optional(),
  createdAt: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  updatedAt: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
});

export const CourseUncheckedUpdateWithoutTasksInputSchema: z.ZodType<Prisma.CourseUncheckedUpdateWithoutTasksInput> = z.strictObject({
  id: z.union([ z.uuid(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  userId: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  name: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  rubric: z.union([ z.lazy(() => NullableJsonNullValueInputSchema), InputJsonValueSchema ]).optional(),
  createdAt: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  updatedAt: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
});

export const TaskUpsertWithoutChildrenInputSchema: z.ZodType<Prisma.TaskUpsertWithoutChildrenInput> = z.strictObject({
  update: z.union([ z.lazy(() => TaskUpdateWithoutChildrenInputSchema), z.lazy(() => TaskUncheckedUpdateWithoutChildrenInputSchema) ]),
  create: z.union([ z.lazy(() => TaskCreateWithoutChildrenInputSchema), z.lazy(() => TaskUncheckedCreateWithoutChildrenInputSchema) ]),
  where: z.lazy(() => TaskWhereInputSchema).optional(),
});

export const TaskUpdateToOneWithWhereWithoutChildrenInputSchema: z.ZodType<Prisma.TaskUpdateToOneWithWhereWithoutChildrenInput> = z.strictObject({
  where: z.lazy(() => TaskWhereInputSchema).optional(),
  data: z.union([ z.lazy(() => TaskUpdateWithoutChildrenInputSchema), z.lazy(() => TaskUncheckedUpdateWithoutChildrenInputSchema) ]),
});

export const TaskUpdateWithoutChildrenInputSchema: z.ZodType<Prisma.TaskUpdateWithoutChildrenInput> = z.strictObject({
  id: z.union([ z.uuid(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  userId: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  title: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  description: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  importance: z.union([ z.number().int(),z.lazy(() => IntFieldUpdateOperationsInputSchema) ]).optional(),
  weight: z.union([ z.number().int(),z.lazy(() => IntFieldUpdateOperationsInputSchema) ]).optional(),
  deadline: z.union([ z.coerce.date(),z.lazy(() => NullableDateTimeFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  position: z.union([ z.number().int(),z.lazy(() => IntFieldUpdateOperationsInputSchema) ]).optional(),
  type: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  isCompleted: z.union([ z.boolean(),z.lazy(() => BoolFieldUpdateOperationsInputSchema) ]).optional(),
  estimatedPomodoros: z.union([ z.number().int(),z.lazy(() => IntFieldUpdateOperationsInputSchema) ]).optional(),
  createdAt: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  updatedAt: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  course: z.lazy(() => CourseUpdateOneWithoutTasksNestedInputSchema).optional(),
  parent: z.lazy(() => TaskUpdateOneWithoutChildrenNestedInputSchema).optional(),
  attachments: z.lazy(() => AttachmentUpdateManyWithoutTaskNestedInputSchema).optional(),
});

export const TaskUncheckedUpdateWithoutChildrenInputSchema: z.ZodType<Prisma.TaskUncheckedUpdateWithoutChildrenInput> = z.strictObject({
  id: z.union([ z.uuid(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  userId: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  title: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  description: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  importance: z.union([ z.number().int(),z.lazy(() => IntFieldUpdateOperationsInputSchema) ]).optional(),
  weight: z.union([ z.number().int(),z.lazy(() => IntFieldUpdateOperationsInputSchema) ]).optional(),
  deadline: z.union([ z.coerce.date(),z.lazy(() => NullableDateTimeFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  position: z.union([ z.number().int(),z.lazy(() => IntFieldUpdateOperationsInputSchema) ]).optional(),
  type: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  isCompleted: z.union([ z.boolean(),z.lazy(() => BoolFieldUpdateOperationsInputSchema) ]).optional(),
  estimatedPomodoros: z.union([ z.number().int(),z.lazy(() => IntFieldUpdateOperationsInputSchema) ]).optional(),
  courseId: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  parentId: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  createdAt: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  updatedAt: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  attachments: z.lazy(() => AttachmentUncheckedUpdateManyWithoutTaskNestedInputSchema).optional(),
});

export const TaskUpsertWithWhereUniqueWithoutParentInputSchema: z.ZodType<Prisma.TaskUpsertWithWhereUniqueWithoutParentInput> = z.strictObject({
  where: z.lazy(() => TaskWhereUniqueInputSchema),
  update: z.union([ z.lazy(() => TaskUpdateWithoutParentInputSchema), z.lazy(() => TaskUncheckedUpdateWithoutParentInputSchema) ]),
  create: z.union([ z.lazy(() => TaskCreateWithoutParentInputSchema), z.lazy(() => TaskUncheckedCreateWithoutParentInputSchema) ]),
});

export const TaskUpdateWithWhereUniqueWithoutParentInputSchema: z.ZodType<Prisma.TaskUpdateWithWhereUniqueWithoutParentInput> = z.strictObject({
  where: z.lazy(() => TaskWhereUniqueInputSchema),
  data: z.union([ z.lazy(() => TaskUpdateWithoutParentInputSchema), z.lazy(() => TaskUncheckedUpdateWithoutParentInputSchema) ]),
});

export const TaskUpdateManyWithWhereWithoutParentInputSchema: z.ZodType<Prisma.TaskUpdateManyWithWhereWithoutParentInput> = z.strictObject({
  where: z.lazy(() => TaskScalarWhereInputSchema),
  data: z.union([ z.lazy(() => TaskUpdateManyMutationInputSchema), z.lazy(() => TaskUncheckedUpdateManyWithoutParentInputSchema) ]),
});

export const AttachmentUpsertWithWhereUniqueWithoutTaskInputSchema: z.ZodType<Prisma.AttachmentUpsertWithWhereUniqueWithoutTaskInput> = z.strictObject({
  where: z.lazy(() => AttachmentWhereUniqueInputSchema),
  update: z.union([ z.lazy(() => AttachmentUpdateWithoutTaskInputSchema), z.lazy(() => AttachmentUncheckedUpdateWithoutTaskInputSchema) ]),
  create: z.union([ z.lazy(() => AttachmentCreateWithoutTaskInputSchema), z.lazy(() => AttachmentUncheckedCreateWithoutTaskInputSchema) ]),
});

export const AttachmentUpdateWithWhereUniqueWithoutTaskInputSchema: z.ZodType<Prisma.AttachmentUpdateWithWhereUniqueWithoutTaskInput> = z.strictObject({
  where: z.lazy(() => AttachmentWhereUniqueInputSchema),
  data: z.union([ z.lazy(() => AttachmentUpdateWithoutTaskInputSchema), z.lazy(() => AttachmentUncheckedUpdateWithoutTaskInputSchema) ]),
});

export const AttachmentUpdateManyWithWhereWithoutTaskInputSchema: z.ZodType<Prisma.AttachmentUpdateManyWithWhereWithoutTaskInput> = z.strictObject({
  where: z.lazy(() => AttachmentScalarWhereInputSchema),
  data: z.union([ z.lazy(() => AttachmentUpdateManyMutationInputSchema), z.lazy(() => AttachmentUncheckedUpdateManyWithoutTaskInputSchema) ]),
});

export const AttachmentScalarWhereInputSchema: z.ZodType<Prisma.AttachmentScalarWhereInput> = z.strictObject({
  AND: z.union([ z.lazy(() => AttachmentScalarWhereInputSchema), z.lazy(() => AttachmentScalarWhereInputSchema).array() ]).optional(),
  OR: z.lazy(() => AttachmentScalarWhereInputSchema).array().optional(),
  NOT: z.union([ z.lazy(() => AttachmentScalarWhereInputSchema), z.lazy(() => AttachmentScalarWhereInputSchema).array() ]).optional(),
  id: z.union([ z.lazy(() => StringFilterSchema), z.string() ]).optional(),
  taskId: z.union([ z.lazy(() => StringFilterSchema), z.string() ]).optional(),
  name: z.union([ z.lazy(() => StringFilterSchema), z.string() ]).optional(),
  url: z.union([ z.lazy(() => StringFilterSchema), z.string() ]).optional(),
  type: z.union([ z.lazy(() => StringFilterSchema), z.string() ]).optional(),
  createdAt: z.union([ z.lazy(() => DateTimeFilterSchema), z.coerce.date() ]).optional(),
});

export const TaskCreateWithoutAttachmentsInputSchema: z.ZodType<Prisma.TaskCreateWithoutAttachmentsInput> = z.strictObject({
  id: z.uuid().optional(),
  userId: z.string(),
  title: z.string(),
  description: z.string().optional().nullable(),
  importance: z.number().int().optional(),
  weight: z.number().int().optional(),
  deadline: z.coerce.date().optional().nullable(),
  position: z.number().int().optional(),
  type: z.string().optional(),
  isCompleted: z.boolean().optional(),
  estimatedPomodoros: z.number().int().optional(),
  createdAt: z.coerce.date().optional(),
  updatedAt: z.coerce.date().optional(),
  course: z.lazy(() => CourseCreateNestedOneWithoutTasksInputSchema).optional(),
  parent: z.lazy(() => TaskCreateNestedOneWithoutChildrenInputSchema).optional(),
  children: z.lazy(() => TaskCreateNestedManyWithoutParentInputSchema).optional(),
});

export const TaskUncheckedCreateWithoutAttachmentsInputSchema: z.ZodType<Prisma.TaskUncheckedCreateWithoutAttachmentsInput> = z.strictObject({
  id: z.uuid().optional(),
  userId: z.string(),
  title: z.string(),
  description: z.string().optional().nullable(),
  importance: z.number().int().optional(),
  weight: z.number().int().optional(),
  deadline: z.coerce.date().optional().nullable(),
  position: z.number().int().optional(),
  type: z.string().optional(),
  isCompleted: z.boolean().optional(),
  estimatedPomodoros: z.number().int().optional(),
  courseId: z.string().optional().nullable(),
  parentId: z.string().optional().nullable(),
  createdAt: z.coerce.date().optional(),
  updatedAt: z.coerce.date().optional(),
  children: z.lazy(() => TaskUncheckedCreateNestedManyWithoutParentInputSchema).optional(),
});

export const TaskCreateOrConnectWithoutAttachmentsInputSchema: z.ZodType<Prisma.TaskCreateOrConnectWithoutAttachmentsInput> = z.strictObject({
  where: z.lazy(() => TaskWhereUniqueInputSchema),
  create: z.union([ z.lazy(() => TaskCreateWithoutAttachmentsInputSchema), z.lazy(() => TaskUncheckedCreateWithoutAttachmentsInputSchema) ]),
});

export const TaskUpsertWithoutAttachmentsInputSchema: z.ZodType<Prisma.TaskUpsertWithoutAttachmentsInput> = z.strictObject({
  update: z.union([ z.lazy(() => TaskUpdateWithoutAttachmentsInputSchema), z.lazy(() => TaskUncheckedUpdateWithoutAttachmentsInputSchema) ]),
  create: z.union([ z.lazy(() => TaskCreateWithoutAttachmentsInputSchema), z.lazy(() => TaskUncheckedCreateWithoutAttachmentsInputSchema) ]),
  where: z.lazy(() => TaskWhereInputSchema).optional(),
});

export const TaskUpdateToOneWithWhereWithoutAttachmentsInputSchema: z.ZodType<Prisma.TaskUpdateToOneWithWhereWithoutAttachmentsInput> = z.strictObject({
  where: z.lazy(() => TaskWhereInputSchema).optional(),
  data: z.union([ z.lazy(() => TaskUpdateWithoutAttachmentsInputSchema), z.lazy(() => TaskUncheckedUpdateWithoutAttachmentsInputSchema) ]),
});

export const TaskUpdateWithoutAttachmentsInputSchema: z.ZodType<Prisma.TaskUpdateWithoutAttachmentsInput> = z.strictObject({
  id: z.union([ z.uuid(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  userId: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  title: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  description: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  importance: z.union([ z.number().int(),z.lazy(() => IntFieldUpdateOperationsInputSchema) ]).optional(),
  weight: z.union([ z.number().int(),z.lazy(() => IntFieldUpdateOperationsInputSchema) ]).optional(),
  deadline: z.union([ z.coerce.date(),z.lazy(() => NullableDateTimeFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  position: z.union([ z.number().int(),z.lazy(() => IntFieldUpdateOperationsInputSchema) ]).optional(),
  type: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  isCompleted: z.union([ z.boolean(),z.lazy(() => BoolFieldUpdateOperationsInputSchema) ]).optional(),
  estimatedPomodoros: z.union([ z.number().int(),z.lazy(() => IntFieldUpdateOperationsInputSchema) ]).optional(),
  createdAt: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  updatedAt: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  course: z.lazy(() => CourseUpdateOneWithoutTasksNestedInputSchema).optional(),
  parent: z.lazy(() => TaskUpdateOneWithoutChildrenNestedInputSchema).optional(),
  children: z.lazy(() => TaskUpdateManyWithoutParentNestedInputSchema).optional(),
});

export const TaskUncheckedUpdateWithoutAttachmentsInputSchema: z.ZodType<Prisma.TaskUncheckedUpdateWithoutAttachmentsInput> = z.strictObject({
  id: z.union([ z.uuid(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  userId: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  title: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  description: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  importance: z.union([ z.number().int(),z.lazy(() => IntFieldUpdateOperationsInputSchema) ]).optional(),
  weight: z.union([ z.number().int(),z.lazy(() => IntFieldUpdateOperationsInputSchema) ]).optional(),
  deadline: z.union([ z.coerce.date(),z.lazy(() => NullableDateTimeFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  position: z.union([ z.number().int(),z.lazy(() => IntFieldUpdateOperationsInputSchema) ]).optional(),
  type: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  isCompleted: z.union([ z.boolean(),z.lazy(() => BoolFieldUpdateOperationsInputSchema) ]).optional(),
  estimatedPomodoros: z.union([ z.number().int(),z.lazy(() => IntFieldUpdateOperationsInputSchema) ]).optional(),
  courseId: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  parentId: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  createdAt: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  updatedAt: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  children: z.lazy(() => TaskUncheckedUpdateManyWithoutParentNestedInputSchema).optional(),
});

export const TaskCreateManyCourseInputSchema: z.ZodType<Prisma.TaskCreateManyCourseInput> = z.strictObject({
  id: z.uuid().optional(),
  userId: z.string(),
  title: z.string(),
  description: z.string().optional().nullable(),
  importance: z.number().int().optional(),
  weight: z.number().int().optional(),
  deadline: z.coerce.date().optional().nullable(),
  position: z.number().int().optional(),
  type: z.string().optional(),
  isCompleted: z.boolean().optional(),
  estimatedPomodoros: z.number().int().optional(),
  parentId: z.string().optional().nullable(),
  createdAt: z.coerce.date().optional(),
  updatedAt: z.coerce.date().optional(),
});

export const TaskUpdateWithoutCourseInputSchema: z.ZodType<Prisma.TaskUpdateWithoutCourseInput> = z.strictObject({
  id: z.union([ z.uuid(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  userId: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  title: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  description: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  importance: z.union([ z.number().int(),z.lazy(() => IntFieldUpdateOperationsInputSchema) ]).optional(),
  weight: z.union([ z.number().int(),z.lazy(() => IntFieldUpdateOperationsInputSchema) ]).optional(),
  deadline: z.union([ z.coerce.date(),z.lazy(() => NullableDateTimeFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  position: z.union([ z.number().int(),z.lazy(() => IntFieldUpdateOperationsInputSchema) ]).optional(),
  type: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  isCompleted: z.union([ z.boolean(),z.lazy(() => BoolFieldUpdateOperationsInputSchema) ]).optional(),
  estimatedPomodoros: z.union([ z.number().int(),z.lazy(() => IntFieldUpdateOperationsInputSchema) ]).optional(),
  createdAt: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  updatedAt: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  parent: z.lazy(() => TaskUpdateOneWithoutChildrenNestedInputSchema).optional(),
  children: z.lazy(() => TaskUpdateManyWithoutParentNestedInputSchema).optional(),
  attachments: z.lazy(() => AttachmentUpdateManyWithoutTaskNestedInputSchema).optional(),
});

export const TaskUncheckedUpdateWithoutCourseInputSchema: z.ZodType<Prisma.TaskUncheckedUpdateWithoutCourseInput> = z.strictObject({
  id: z.union([ z.uuid(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  userId: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  title: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  description: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  importance: z.union([ z.number().int(),z.lazy(() => IntFieldUpdateOperationsInputSchema) ]).optional(),
  weight: z.union([ z.number().int(),z.lazy(() => IntFieldUpdateOperationsInputSchema) ]).optional(),
  deadline: z.union([ z.coerce.date(),z.lazy(() => NullableDateTimeFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  position: z.union([ z.number().int(),z.lazy(() => IntFieldUpdateOperationsInputSchema) ]).optional(),
  type: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  isCompleted: z.union([ z.boolean(),z.lazy(() => BoolFieldUpdateOperationsInputSchema) ]).optional(),
  estimatedPomodoros: z.union([ z.number().int(),z.lazy(() => IntFieldUpdateOperationsInputSchema) ]).optional(),
  parentId: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  createdAt: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  updatedAt: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  children: z.lazy(() => TaskUncheckedUpdateManyWithoutParentNestedInputSchema).optional(),
  attachments: z.lazy(() => AttachmentUncheckedUpdateManyWithoutTaskNestedInputSchema).optional(),
});

export const TaskUncheckedUpdateManyWithoutCourseInputSchema: z.ZodType<Prisma.TaskUncheckedUpdateManyWithoutCourseInput> = z.strictObject({
  id: z.union([ z.uuid(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  userId: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  title: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  description: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  importance: z.union([ z.number().int(),z.lazy(() => IntFieldUpdateOperationsInputSchema) ]).optional(),
  weight: z.union([ z.number().int(),z.lazy(() => IntFieldUpdateOperationsInputSchema) ]).optional(),
  deadline: z.union([ z.coerce.date(),z.lazy(() => NullableDateTimeFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  position: z.union([ z.number().int(),z.lazy(() => IntFieldUpdateOperationsInputSchema) ]).optional(),
  type: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  isCompleted: z.union([ z.boolean(),z.lazy(() => BoolFieldUpdateOperationsInputSchema) ]).optional(),
  estimatedPomodoros: z.union([ z.number().int(),z.lazy(() => IntFieldUpdateOperationsInputSchema) ]).optional(),
  parentId: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  createdAt: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  updatedAt: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
});

export const TaskCreateManyParentInputSchema: z.ZodType<Prisma.TaskCreateManyParentInput> = z.strictObject({
  id: z.uuid().optional(),
  userId: z.string(),
  title: z.string(),
  description: z.string().optional().nullable(),
  importance: z.number().int().optional(),
  weight: z.number().int().optional(),
  deadline: z.coerce.date().optional().nullable(),
  position: z.number().int().optional(),
  type: z.string().optional(),
  isCompleted: z.boolean().optional(),
  estimatedPomodoros: z.number().int().optional(),
  courseId: z.string().optional().nullable(),
  createdAt: z.coerce.date().optional(),
  updatedAt: z.coerce.date().optional(),
});

export const AttachmentCreateManyTaskInputSchema: z.ZodType<Prisma.AttachmentCreateManyTaskInput> = z.strictObject({
  id: z.uuid().optional(),
  name: z.string(),
  url: z.string(),
  type: z.string(),
  createdAt: z.coerce.date().optional(),
});

export const TaskUpdateWithoutParentInputSchema: z.ZodType<Prisma.TaskUpdateWithoutParentInput> = z.strictObject({
  id: z.union([ z.uuid(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  userId: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  title: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  description: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  importance: z.union([ z.number().int(),z.lazy(() => IntFieldUpdateOperationsInputSchema) ]).optional(),
  weight: z.union([ z.number().int(),z.lazy(() => IntFieldUpdateOperationsInputSchema) ]).optional(),
  deadline: z.union([ z.coerce.date(),z.lazy(() => NullableDateTimeFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  position: z.union([ z.number().int(),z.lazy(() => IntFieldUpdateOperationsInputSchema) ]).optional(),
  type: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  isCompleted: z.union([ z.boolean(),z.lazy(() => BoolFieldUpdateOperationsInputSchema) ]).optional(),
  estimatedPomodoros: z.union([ z.number().int(),z.lazy(() => IntFieldUpdateOperationsInputSchema) ]).optional(),
  createdAt: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  updatedAt: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  course: z.lazy(() => CourseUpdateOneWithoutTasksNestedInputSchema).optional(),
  children: z.lazy(() => TaskUpdateManyWithoutParentNestedInputSchema).optional(),
  attachments: z.lazy(() => AttachmentUpdateManyWithoutTaskNestedInputSchema).optional(),
});

export const TaskUncheckedUpdateWithoutParentInputSchema: z.ZodType<Prisma.TaskUncheckedUpdateWithoutParentInput> = z.strictObject({
  id: z.union([ z.uuid(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  userId: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  title: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  description: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  importance: z.union([ z.number().int(),z.lazy(() => IntFieldUpdateOperationsInputSchema) ]).optional(),
  weight: z.union([ z.number().int(),z.lazy(() => IntFieldUpdateOperationsInputSchema) ]).optional(),
  deadline: z.union([ z.coerce.date(),z.lazy(() => NullableDateTimeFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  position: z.union([ z.number().int(),z.lazy(() => IntFieldUpdateOperationsInputSchema) ]).optional(),
  type: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  isCompleted: z.union([ z.boolean(),z.lazy(() => BoolFieldUpdateOperationsInputSchema) ]).optional(),
  estimatedPomodoros: z.union([ z.number().int(),z.lazy(() => IntFieldUpdateOperationsInputSchema) ]).optional(),
  courseId: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  createdAt: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  updatedAt: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  children: z.lazy(() => TaskUncheckedUpdateManyWithoutParentNestedInputSchema).optional(),
  attachments: z.lazy(() => AttachmentUncheckedUpdateManyWithoutTaskNestedInputSchema).optional(),
});

export const TaskUncheckedUpdateManyWithoutParentInputSchema: z.ZodType<Prisma.TaskUncheckedUpdateManyWithoutParentInput> = z.strictObject({
  id: z.union([ z.uuid(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  userId: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  title: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  description: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  importance: z.union([ z.number().int(),z.lazy(() => IntFieldUpdateOperationsInputSchema) ]).optional(),
  weight: z.union([ z.number().int(),z.lazy(() => IntFieldUpdateOperationsInputSchema) ]).optional(),
  deadline: z.union([ z.coerce.date(),z.lazy(() => NullableDateTimeFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  position: z.union([ z.number().int(),z.lazy(() => IntFieldUpdateOperationsInputSchema) ]).optional(),
  type: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  isCompleted: z.union([ z.boolean(),z.lazy(() => BoolFieldUpdateOperationsInputSchema) ]).optional(),
  estimatedPomodoros: z.union([ z.number().int(),z.lazy(() => IntFieldUpdateOperationsInputSchema) ]).optional(),
  courseId: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  createdAt: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  updatedAt: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
});

export const AttachmentUpdateWithoutTaskInputSchema: z.ZodType<Prisma.AttachmentUpdateWithoutTaskInput> = z.strictObject({
  id: z.union([ z.uuid(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  name: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  url: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  type: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  createdAt: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
});

export const AttachmentUncheckedUpdateWithoutTaskInputSchema: z.ZodType<Prisma.AttachmentUncheckedUpdateWithoutTaskInput> = z.strictObject({
  id: z.union([ z.uuid(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  name: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  url: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  type: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  createdAt: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
});

export const AttachmentUncheckedUpdateManyWithoutTaskInputSchema: z.ZodType<Prisma.AttachmentUncheckedUpdateManyWithoutTaskInput> = z.strictObject({
  id: z.union([ z.uuid(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  name: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  url: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  type: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  createdAt: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
});

/////////////////////////////////////////
// ARGS
/////////////////////////////////////////

export const CourseFindFirstArgsSchema: z.ZodType<Prisma.CourseFindFirstArgs> = z.object({
  select: CourseSelectSchema.optional(),
  include: CourseIncludeSchema.optional(),
  where: CourseWhereInputSchema.optional(), 
  orderBy: z.union([ CourseOrderByWithRelationInputSchema.array(), CourseOrderByWithRelationInputSchema ]).optional(),
  cursor: CourseWhereUniqueInputSchema.optional(), 
  take: z.number().optional(),
  skip: z.number().optional(),
  distinct: z.union([ CourseScalarFieldEnumSchema, CourseScalarFieldEnumSchema.array() ]).optional(),
}).strict();

export const CourseFindFirstOrThrowArgsSchema: z.ZodType<Prisma.CourseFindFirstOrThrowArgs> = z.object({
  select: CourseSelectSchema.optional(),
  include: CourseIncludeSchema.optional(),
  where: CourseWhereInputSchema.optional(), 
  orderBy: z.union([ CourseOrderByWithRelationInputSchema.array(), CourseOrderByWithRelationInputSchema ]).optional(),
  cursor: CourseWhereUniqueInputSchema.optional(), 
  take: z.number().optional(),
  skip: z.number().optional(),
  distinct: z.union([ CourseScalarFieldEnumSchema, CourseScalarFieldEnumSchema.array() ]).optional(),
}).strict();

export const CourseFindManyArgsSchema: z.ZodType<Prisma.CourseFindManyArgs> = z.object({
  select: CourseSelectSchema.optional(),
  include: CourseIncludeSchema.optional(),
  where: CourseWhereInputSchema.optional(), 
  orderBy: z.union([ CourseOrderByWithRelationInputSchema.array(), CourseOrderByWithRelationInputSchema ]).optional(),
  cursor: CourseWhereUniqueInputSchema.optional(), 
  take: z.number().optional(),
  skip: z.number().optional(),
  distinct: z.union([ CourseScalarFieldEnumSchema, CourseScalarFieldEnumSchema.array() ]).optional(),
}).strict();

export const CourseAggregateArgsSchema: z.ZodType<Prisma.CourseAggregateArgs> = z.object({
  where: CourseWhereInputSchema.optional(), 
  orderBy: z.union([ CourseOrderByWithRelationInputSchema.array(), CourseOrderByWithRelationInputSchema ]).optional(),
  cursor: CourseWhereUniqueInputSchema.optional(), 
  take: z.number().optional(),
  skip: z.number().optional(),
}).strict();

export const CourseGroupByArgsSchema: z.ZodType<Prisma.CourseGroupByArgs> = z.object({
  where: CourseWhereInputSchema.optional(), 
  orderBy: z.union([ CourseOrderByWithAggregationInputSchema.array(), CourseOrderByWithAggregationInputSchema ]).optional(),
  by: CourseScalarFieldEnumSchema.array(), 
  having: CourseScalarWhereWithAggregatesInputSchema.optional(), 
  take: z.number().optional(),
  skip: z.number().optional(),
}).strict();

export const CourseFindUniqueArgsSchema: z.ZodType<Prisma.CourseFindUniqueArgs> = z.object({
  select: CourseSelectSchema.optional(),
  include: CourseIncludeSchema.optional(),
  where: CourseWhereUniqueInputSchema, 
}).strict();

export const CourseFindUniqueOrThrowArgsSchema: z.ZodType<Prisma.CourseFindUniqueOrThrowArgs> = z.object({
  select: CourseSelectSchema.optional(),
  include: CourseIncludeSchema.optional(),
  where: CourseWhereUniqueInputSchema, 
}).strict();

export const TaskFindFirstArgsSchema: z.ZodType<Prisma.TaskFindFirstArgs> = z.object({
  select: TaskSelectSchema.optional(),
  include: TaskIncludeSchema.optional(),
  where: TaskWhereInputSchema.optional(), 
  orderBy: z.union([ TaskOrderByWithRelationInputSchema.array(), TaskOrderByWithRelationInputSchema ]).optional(),
  cursor: TaskWhereUniqueInputSchema.optional(), 
  take: z.number().optional(),
  skip: z.number().optional(),
  distinct: z.union([ TaskScalarFieldEnumSchema, TaskScalarFieldEnumSchema.array() ]).optional(),
}).strict();

export const TaskFindFirstOrThrowArgsSchema: z.ZodType<Prisma.TaskFindFirstOrThrowArgs> = z.object({
  select: TaskSelectSchema.optional(),
  include: TaskIncludeSchema.optional(),
  where: TaskWhereInputSchema.optional(), 
  orderBy: z.union([ TaskOrderByWithRelationInputSchema.array(), TaskOrderByWithRelationInputSchema ]).optional(),
  cursor: TaskWhereUniqueInputSchema.optional(), 
  take: z.number().optional(),
  skip: z.number().optional(),
  distinct: z.union([ TaskScalarFieldEnumSchema, TaskScalarFieldEnumSchema.array() ]).optional(),
}).strict();

export const TaskFindManyArgsSchema: z.ZodType<Prisma.TaskFindManyArgs> = z.object({
  select: TaskSelectSchema.optional(),
  include: TaskIncludeSchema.optional(),
  where: TaskWhereInputSchema.optional(), 
  orderBy: z.union([ TaskOrderByWithRelationInputSchema.array(), TaskOrderByWithRelationInputSchema ]).optional(),
  cursor: TaskWhereUniqueInputSchema.optional(), 
  take: z.number().optional(),
  skip: z.number().optional(),
  distinct: z.union([ TaskScalarFieldEnumSchema, TaskScalarFieldEnumSchema.array() ]).optional(),
}).strict();

export const TaskAggregateArgsSchema: z.ZodType<Prisma.TaskAggregateArgs> = z.object({
  where: TaskWhereInputSchema.optional(), 
  orderBy: z.union([ TaskOrderByWithRelationInputSchema.array(), TaskOrderByWithRelationInputSchema ]).optional(),
  cursor: TaskWhereUniqueInputSchema.optional(), 
  take: z.number().optional(),
  skip: z.number().optional(),
}).strict();

export const TaskGroupByArgsSchema: z.ZodType<Prisma.TaskGroupByArgs> = z.object({
  where: TaskWhereInputSchema.optional(), 
  orderBy: z.union([ TaskOrderByWithAggregationInputSchema.array(), TaskOrderByWithAggregationInputSchema ]).optional(),
  by: TaskScalarFieldEnumSchema.array(), 
  having: TaskScalarWhereWithAggregatesInputSchema.optional(), 
  take: z.number().optional(),
  skip: z.number().optional(),
}).strict();

export const TaskFindUniqueArgsSchema: z.ZodType<Prisma.TaskFindUniqueArgs> = z.object({
  select: TaskSelectSchema.optional(),
  include: TaskIncludeSchema.optional(),
  where: TaskWhereUniqueInputSchema, 
}).strict();

export const TaskFindUniqueOrThrowArgsSchema: z.ZodType<Prisma.TaskFindUniqueOrThrowArgs> = z.object({
  select: TaskSelectSchema.optional(),
  include: TaskIncludeSchema.optional(),
  where: TaskWhereUniqueInputSchema, 
}).strict();

export const AttachmentFindFirstArgsSchema: z.ZodType<Prisma.AttachmentFindFirstArgs> = z.object({
  select: AttachmentSelectSchema.optional(),
  include: AttachmentIncludeSchema.optional(),
  where: AttachmentWhereInputSchema.optional(), 
  orderBy: z.union([ AttachmentOrderByWithRelationInputSchema.array(), AttachmentOrderByWithRelationInputSchema ]).optional(),
  cursor: AttachmentWhereUniqueInputSchema.optional(), 
  take: z.number().optional(),
  skip: z.number().optional(),
  distinct: z.union([ AttachmentScalarFieldEnumSchema, AttachmentScalarFieldEnumSchema.array() ]).optional(),
}).strict();

export const AttachmentFindFirstOrThrowArgsSchema: z.ZodType<Prisma.AttachmentFindFirstOrThrowArgs> = z.object({
  select: AttachmentSelectSchema.optional(),
  include: AttachmentIncludeSchema.optional(),
  where: AttachmentWhereInputSchema.optional(), 
  orderBy: z.union([ AttachmentOrderByWithRelationInputSchema.array(), AttachmentOrderByWithRelationInputSchema ]).optional(),
  cursor: AttachmentWhereUniqueInputSchema.optional(), 
  take: z.number().optional(),
  skip: z.number().optional(),
  distinct: z.union([ AttachmentScalarFieldEnumSchema, AttachmentScalarFieldEnumSchema.array() ]).optional(),
}).strict();

export const AttachmentFindManyArgsSchema: z.ZodType<Prisma.AttachmentFindManyArgs> = z.object({
  select: AttachmentSelectSchema.optional(),
  include: AttachmentIncludeSchema.optional(),
  where: AttachmentWhereInputSchema.optional(), 
  orderBy: z.union([ AttachmentOrderByWithRelationInputSchema.array(), AttachmentOrderByWithRelationInputSchema ]).optional(),
  cursor: AttachmentWhereUniqueInputSchema.optional(), 
  take: z.number().optional(),
  skip: z.number().optional(),
  distinct: z.union([ AttachmentScalarFieldEnumSchema, AttachmentScalarFieldEnumSchema.array() ]).optional(),
}).strict();

export const AttachmentAggregateArgsSchema: z.ZodType<Prisma.AttachmentAggregateArgs> = z.object({
  where: AttachmentWhereInputSchema.optional(), 
  orderBy: z.union([ AttachmentOrderByWithRelationInputSchema.array(), AttachmentOrderByWithRelationInputSchema ]).optional(),
  cursor: AttachmentWhereUniqueInputSchema.optional(), 
  take: z.number().optional(),
  skip: z.number().optional(),
}).strict();

export const AttachmentGroupByArgsSchema: z.ZodType<Prisma.AttachmentGroupByArgs> = z.object({
  where: AttachmentWhereInputSchema.optional(), 
  orderBy: z.union([ AttachmentOrderByWithAggregationInputSchema.array(), AttachmentOrderByWithAggregationInputSchema ]).optional(),
  by: AttachmentScalarFieldEnumSchema.array(), 
  having: AttachmentScalarWhereWithAggregatesInputSchema.optional(), 
  take: z.number().optional(),
  skip: z.number().optional(),
}).strict();

export const AttachmentFindUniqueArgsSchema: z.ZodType<Prisma.AttachmentFindUniqueArgs> = z.object({
  select: AttachmentSelectSchema.optional(),
  include: AttachmentIncludeSchema.optional(),
  where: AttachmentWhereUniqueInputSchema, 
}).strict();

export const AttachmentFindUniqueOrThrowArgsSchema: z.ZodType<Prisma.AttachmentFindUniqueOrThrowArgs> = z.object({
  select: AttachmentSelectSchema.optional(),
  include: AttachmentIncludeSchema.optional(),
  where: AttachmentWhereUniqueInputSchema, 
}).strict();

export const CourseCreateArgsSchema: z.ZodType<Prisma.CourseCreateArgs> = z.object({
  select: CourseSelectSchema.optional(),
  include: CourseIncludeSchema.optional(),
  data: z.union([ CourseCreateInputSchema, CourseUncheckedCreateInputSchema ]),
}).strict();

export const CourseUpsertArgsSchema: z.ZodType<Prisma.CourseUpsertArgs> = z.object({
  select: CourseSelectSchema.optional(),
  include: CourseIncludeSchema.optional(),
  where: CourseWhereUniqueInputSchema, 
  create: z.union([ CourseCreateInputSchema, CourseUncheckedCreateInputSchema ]),
  update: z.union([ CourseUpdateInputSchema, CourseUncheckedUpdateInputSchema ]),
}).strict();

export const CourseCreateManyArgsSchema: z.ZodType<Prisma.CourseCreateManyArgs> = z.object({
  data: z.union([ CourseCreateManyInputSchema, CourseCreateManyInputSchema.array() ]),
  skipDuplicates: z.boolean().optional(),
}).strict();

export const CourseCreateManyAndReturnArgsSchema: z.ZodType<Prisma.CourseCreateManyAndReturnArgs> = z.object({
  data: z.union([ CourseCreateManyInputSchema, CourseCreateManyInputSchema.array() ]),
  skipDuplicates: z.boolean().optional(),
}).strict();

export const CourseDeleteArgsSchema: z.ZodType<Prisma.CourseDeleteArgs> = z.object({
  select: CourseSelectSchema.optional(),
  include: CourseIncludeSchema.optional(),
  where: CourseWhereUniqueInputSchema, 
}).strict();

export const CourseUpdateArgsSchema: z.ZodType<Prisma.CourseUpdateArgs> = z.object({
  select: CourseSelectSchema.optional(),
  include: CourseIncludeSchema.optional(),
  data: z.union([ CourseUpdateInputSchema, CourseUncheckedUpdateInputSchema ]),
  where: CourseWhereUniqueInputSchema, 
}).strict();

export const CourseUpdateManyArgsSchema: z.ZodType<Prisma.CourseUpdateManyArgs> = z.object({
  data: z.union([ CourseUpdateManyMutationInputSchema, CourseUncheckedUpdateManyInputSchema ]),
  where: CourseWhereInputSchema.optional(), 
  limit: z.number().optional(),
}).strict();

export const CourseUpdateManyAndReturnArgsSchema: z.ZodType<Prisma.CourseUpdateManyAndReturnArgs> = z.object({
  data: z.union([ CourseUpdateManyMutationInputSchema, CourseUncheckedUpdateManyInputSchema ]),
  where: CourseWhereInputSchema.optional(), 
  limit: z.number().optional(),
}).strict();

export const CourseDeleteManyArgsSchema: z.ZodType<Prisma.CourseDeleteManyArgs> = z.object({
  where: CourseWhereInputSchema.optional(), 
  limit: z.number().optional(),
}).strict();

export const TaskCreateArgsSchema: z.ZodType<Prisma.TaskCreateArgs> = z.object({
  select: TaskSelectSchema.optional(),
  include: TaskIncludeSchema.optional(),
  data: z.union([ TaskCreateInputSchema, TaskUncheckedCreateInputSchema ]),
}).strict();

export const TaskUpsertArgsSchema: z.ZodType<Prisma.TaskUpsertArgs> = z.object({
  select: TaskSelectSchema.optional(),
  include: TaskIncludeSchema.optional(),
  where: TaskWhereUniqueInputSchema, 
  create: z.union([ TaskCreateInputSchema, TaskUncheckedCreateInputSchema ]),
  update: z.union([ TaskUpdateInputSchema, TaskUncheckedUpdateInputSchema ]),
}).strict();

export const TaskCreateManyArgsSchema: z.ZodType<Prisma.TaskCreateManyArgs> = z.object({
  data: z.union([ TaskCreateManyInputSchema, TaskCreateManyInputSchema.array() ]),
  skipDuplicates: z.boolean().optional(),
}).strict();

export const TaskCreateManyAndReturnArgsSchema: z.ZodType<Prisma.TaskCreateManyAndReturnArgs> = z.object({
  data: z.union([ TaskCreateManyInputSchema, TaskCreateManyInputSchema.array() ]),
  skipDuplicates: z.boolean().optional(),
}).strict();

export const TaskDeleteArgsSchema: z.ZodType<Prisma.TaskDeleteArgs> = z.object({
  select: TaskSelectSchema.optional(),
  include: TaskIncludeSchema.optional(),
  where: TaskWhereUniqueInputSchema, 
}).strict();

export const TaskUpdateArgsSchema: z.ZodType<Prisma.TaskUpdateArgs> = z.object({
  select: TaskSelectSchema.optional(),
  include: TaskIncludeSchema.optional(),
  data: z.union([ TaskUpdateInputSchema, TaskUncheckedUpdateInputSchema ]),
  where: TaskWhereUniqueInputSchema, 
}).strict();

export const TaskUpdateManyArgsSchema: z.ZodType<Prisma.TaskUpdateManyArgs> = z.object({
  data: z.union([ TaskUpdateManyMutationInputSchema, TaskUncheckedUpdateManyInputSchema ]),
  where: TaskWhereInputSchema.optional(), 
  limit: z.number().optional(),
}).strict();

export const TaskUpdateManyAndReturnArgsSchema: z.ZodType<Prisma.TaskUpdateManyAndReturnArgs> = z.object({
  data: z.union([ TaskUpdateManyMutationInputSchema, TaskUncheckedUpdateManyInputSchema ]),
  where: TaskWhereInputSchema.optional(), 
  limit: z.number().optional(),
}).strict();

export const TaskDeleteManyArgsSchema: z.ZodType<Prisma.TaskDeleteManyArgs> = z.object({
  where: TaskWhereInputSchema.optional(), 
  limit: z.number().optional(),
}).strict();

export const AttachmentCreateArgsSchema: z.ZodType<Prisma.AttachmentCreateArgs> = z.object({
  select: AttachmentSelectSchema.optional(),
  include: AttachmentIncludeSchema.optional(),
  data: z.union([ AttachmentCreateInputSchema, AttachmentUncheckedCreateInputSchema ]),
}).strict();

export const AttachmentUpsertArgsSchema: z.ZodType<Prisma.AttachmentUpsertArgs> = z.object({
  select: AttachmentSelectSchema.optional(),
  include: AttachmentIncludeSchema.optional(),
  where: AttachmentWhereUniqueInputSchema, 
  create: z.union([ AttachmentCreateInputSchema, AttachmentUncheckedCreateInputSchema ]),
  update: z.union([ AttachmentUpdateInputSchema, AttachmentUncheckedUpdateInputSchema ]),
}).strict();

export const AttachmentCreateManyArgsSchema: z.ZodType<Prisma.AttachmentCreateManyArgs> = z.object({
  data: z.union([ AttachmentCreateManyInputSchema, AttachmentCreateManyInputSchema.array() ]),
  skipDuplicates: z.boolean().optional(),
}).strict();

export const AttachmentCreateManyAndReturnArgsSchema: z.ZodType<Prisma.AttachmentCreateManyAndReturnArgs> = z.object({
  data: z.union([ AttachmentCreateManyInputSchema, AttachmentCreateManyInputSchema.array() ]),
  skipDuplicates: z.boolean().optional(),
}).strict();

export const AttachmentDeleteArgsSchema: z.ZodType<Prisma.AttachmentDeleteArgs> = z.object({
  select: AttachmentSelectSchema.optional(),
  include: AttachmentIncludeSchema.optional(),
  where: AttachmentWhereUniqueInputSchema, 
}).strict();

export const AttachmentUpdateArgsSchema: z.ZodType<Prisma.AttachmentUpdateArgs> = z.object({
  select: AttachmentSelectSchema.optional(),
  include: AttachmentIncludeSchema.optional(),
  data: z.union([ AttachmentUpdateInputSchema, AttachmentUncheckedUpdateInputSchema ]),
  where: AttachmentWhereUniqueInputSchema, 
}).strict();

export const AttachmentUpdateManyArgsSchema: z.ZodType<Prisma.AttachmentUpdateManyArgs> = z.object({
  data: z.union([ AttachmentUpdateManyMutationInputSchema, AttachmentUncheckedUpdateManyInputSchema ]),
  where: AttachmentWhereInputSchema.optional(), 
  limit: z.number().optional(),
}).strict();

export const AttachmentUpdateManyAndReturnArgsSchema: z.ZodType<Prisma.AttachmentUpdateManyAndReturnArgs> = z.object({
  data: z.union([ AttachmentUpdateManyMutationInputSchema, AttachmentUncheckedUpdateManyInputSchema ]),
  where: AttachmentWhereInputSchema.optional(), 
  limit: z.number().optional(),
}).strict();

export const AttachmentDeleteManyArgsSchema: z.ZodType<Prisma.AttachmentDeleteManyArgs> = z.object({
  where: AttachmentWhereInputSchema.optional(), 
  limit: z.number().optional(),
}).strict();