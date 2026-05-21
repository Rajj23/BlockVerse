package com.blockverse.app.controller;

import com.blockverse.app.dto.SearchResponse;
import com.blockverse.app.service.SearchService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequiredArgsConstructor
@RequestMapping("/v1")
public class SearchController {
    private final SearchService searchService;
    
    @GetMapping("/search")
    public ResponseEntity<SearchResponse> search(@RequestParam String keyword, @RequestParam int workSpaceId){
        SearchResponse response = searchService.search(keyword, workSpaceId);
        return ResponseEntity.ok(response);
    }
}
