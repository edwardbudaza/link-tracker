import { Container } from "inversify";
import "reflect-metadata";
import { TYPES } from "./types";

// Repositories
import { IUrlRepository } from "../interfaces/repositories/IUrlRepository";
import { UrlRepository } from "../repositories/UrlRepository";
import { IAnalyticsRepository } from "../interfaces/repositories/IAnalyticsRepository";
import { AnalyticsRepository } from "../repositories/AnalyticsRepository";
