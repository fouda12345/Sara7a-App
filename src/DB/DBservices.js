export const create = async ({
    model ,
    data = [{}],
    options = {runValidators : true}
} = {}) => {
    return await model.create(data , options);
}

export const findByIdAndUpdate = async ({
    model ,
    id = "",
    data = {$inc : {__v : 1}},
    select = "",
    options = {runValidators : true , new : true},
    populate = []
} = {}) => {
    return await model.
    findByIdAndUpdate(id, data , options)
    .select(select)
    .populate(populate);
}

export const findOne = async ({
    model ,
    filter = {},
    select = "",
    populate = []
} = {}) => {
    return await model.findOne(filter).select(select).populate(populate);
}

export const findById = async ({
    model ,
    id = "",
    select = "",
    populate = []
} = {}) => {
    return await model.findById(id).select(select).populate(populate);
}

export const findByIdAndDelete = async ({
    model ,
    id = "",
} = {}) => {
    return await model.findByIdAndDelete(id);
}