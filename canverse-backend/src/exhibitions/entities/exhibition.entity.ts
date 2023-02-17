import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { ObjectId } from 'mongodb';
import { Document } from 'mongoose';
import * as mongoosePaginate from 'mongoose-paginate-v2';
import { Product } from '../../products/entities/products.entity';
import { ExhibitionStatus, ExhibitionType } from '../types';

@Schema({ collection: 'auctions', timestamps: true })
export class Exhibition extends Document {
  @Prop()
  title!: string;

  @Prop()
  publicId!: string;

  @Prop()
  description!: string;

  @Prop()
  start_date!: Date;

  @Prop()
  end_date!: Date;

  @Prop({ type: String, enum: Object.keys(ExhibitionType) })
  exhibitionType!: ExhibitionType;

  @Prop()
  logoUrl: string;

  @Prop({
    type: String,
    enum: Object.keys(ExhibitionStatus),
    default: ExhibitionStatus.FUTURE,
  })
  status!: ExhibitionStatus;

  /**
   * Organization name per locale, if available.
   * The key is the ISO-639 language code, value is the name in that locale.
   */
  @Prop({ type: Map, of: String })
  organizationNames: Map<string, string>;

  @Prop({ required: true, type: [{ type: Object, ref: 'Product' }] })
  products!: Product[];
}

export const ExhibitionSchema =
  SchemaFactory.createForClass(Exhibition).plugin(mongoosePaginate);
