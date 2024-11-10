import { Model, Document, Types, FilterQuery } from 'mongoose';
import { CustomError } from '../errors/customErrors';
import { HttpStatusCodes } from '../config/HttpStatusCodes';

export class BaseRepository<T extends Document>{
    protected model: Model<T>

    constructor(model:Model<T>){
        this.model = model
    }

    async create(data: Partial<T>): Promise<T>{
        try{
            const entity = new this.model(data)
            return await entity.save()
        }catch (error){
            throw new CustomError(`Failed to create entity:${error}`,HttpStatusCodes.INTERNAL_SERVER_ERROR)
        }
    }

    async findById(id: string | Types.ObjectId): Promise<T | null> {
        try {
          const entity = await this.model.findById(id).exec();
          if (!entity) {
            throw new CustomError('Entity not found', HttpStatusCodes.NOT_FOUND);
          }
          return entity;
        } catch (error) {
          throw new CustomError(`Error finding entity by ID: ${error}`, HttpStatusCodes.INTERNAL_SERVER_ERROR);
        }
    }

    async findOne(query: FilterQuery<T>): Promise<T | null> {
        try {
          return await this.model.findOne(query).exec();
        } catch (error) {
          throw new CustomError(`Error finding entity: ${error}`, HttpStatusCodes.INTERNAL_SERVER_ERROR);
        }
      }
    
      async findAll(): Promise<T[]> {
        try {
          return await this.model.find().exec();
        } catch (error) {
          throw new CustomError(`Error fetching entities: ${error}`, HttpStatusCodes.INTERNAL_SERVER_ERROR);
        }
      }
    
      async update(id: string | Types.ObjectId, data: Partial<T>): Promise<T | null> {
        try {
          const entity = await this.model.findByIdAndUpdate(id, data, { new: true }).exec();
          if (!entity) {
            throw new CustomError('Entity not found', HttpStatusCodes.NOT_FOUND);
          }
          return entity;
        } catch (error) {
          throw new CustomError(`Error updating entity: ${error}`, HttpStatusCodes.INTERNAL_SERVER_ERROR);
        }
      }
    
      async delete(id: string | Types.ObjectId): Promise<void> {
        try {
          await this.model.findByIdAndDelete(id).exec();
        } catch (error) {
          throw new CustomError(`Error deleting entity: ${error}`, HttpStatusCodes.INTERNAL_SERVER_ERROR);
        }
    }
}