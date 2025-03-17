import { IUrlRepository } from "../interfaces/repositories/IUrlRepository";
import UrlModel, { Url } from "../models/Url";
import { injectable } from "inversify";

@injectable()
export class UrlRespository implements IUrlRepository {
  async create(url: Partial<Url>): Promise<Url> {
    const newUrl = new UrlModel(url);
    return await newUrl.save();
  }

  async findByShortId(shortId: string): Promise<Url | null> {
    return await UrlModel.findOne({ shortId, isActive: true });
  }

  async findByOriginalUrl(originalUrl: string): Promise<Url | null> {
    return await UrlModel.findOne({ originalUrl, isActive: true });
  }

  async updateById(id: string, url: Partial<Url>): Promise<Url | null> {
    return await UrlModel.findByIdAndUpdate(id, url, { new: true });
  }

  async delete(id: string): Promise<boolean> {
    const result = await UrlModel.findByIdAndUpdate(id, { isActive: false });
    return !!result;
  }
}
