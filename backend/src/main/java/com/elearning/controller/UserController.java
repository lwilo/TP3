package com.elearning.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.HashMap;
import java.util.Map;

@RestController
@CrossOrigin(origins = "http://localhost:3000")
public class UserController {

    @GetMapping("/me")
    public ResponseEntity<Map<String, Object>> getCurrentUser(@AuthenticationPrincipal Jwt jwt) {
        Map<String, Object> userInfo = new HashMap<>();
        
        userInfo.put("sub", jwt.getSubject());
        userInfo.put("email", jwt.getClaim("email"));
        userInfo.put("name", jwt.getClaim("name"));
        userInfo.put("preferred_username", jwt.getClaim("preferred_username"));
        userInfo.put("given_name", jwt.getClaim("given_name"));
        userInfo.put("family_name", jwt.getClaim("family_name"));
        
        // Extract roles from realm_access
        Map<String, Object> realmAccess = jwt.getClaimAsMap("realm_access");
        if (realmAccess != null && realmAccess.containsKey("roles")) {
            userInfo.put("roles", realmAccess.get("roles"));
        }
        
        // Add all claims for debugging
        userInfo.put("all_claims", jwt.getClaims());
        
        return ResponseEntity.ok(userInfo);
    }
}
