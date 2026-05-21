import api from "./axios";
import { SearchResponse } from "@/types";

export const searchApi = {
  search: (keyword: string, workSpaceId: number) =>
    api.get<SearchResponse>("/v1/search", {
      params: { keyword, workSpaceId }
    }),
};