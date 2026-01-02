package com.example.Clinic_Management_System.filter;

import com.example.Clinic_Management_System.service.CustomUserDetailsService;
import com.example.Clinic_Management_System.util.JwtUtil;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;

@Component
public class JwtFilter extends OncePerRequestFilter {

    @Autowired
    private JwtUtil jwtUtil;

    @Autowired
    private CustomUserDetailsService service;

    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain filterChain)
            throws ServletException, IOException {

        // 1️⃣ Get Authorization header
        String authHeader = request.getHeader("Authorization");

        String token = null;
        String username = null;

        // 2️⃣ Extract token
        if (authHeader != null && authHeader.startsWith("Bearer ")) {
            token = authHeader.substring(7); // Remove "Bearer "
            username = jwtUtil.extractUsername(token);
        }

        // 3️⃣ Check if username is present & not already authenticated
        if (username != null && SecurityContextHolder.getContext().getAuthentication() == null) {

            UserDetails userDetails = service.loadUserByUsername(username);

            // 4️⃣ Validate token
            if (jwtUtil.validateToken(token, userDetails.getUsername())) {

                // Optional: Validate ROLE from token matches the user
                String roleFromToken = (String) jwtUtil.extractAllClaims(token).get("role");

                boolean roleMatches = userDetails.getAuthorities().stream()
                        .anyMatch(a -> a.getAuthority().equals(roleFromToken));

                if (roleMatches) {
                    // 5️⃣ Set Authentication in SecurityContext
                    UsernamePasswordAuthenticationToken authToken = new UsernamePasswordAuthenticationToken(userDetails,
                            null, userDetails.getAuthorities());

                    authToken.setDetails(new WebAuthenticationDetailsSource().buildDetails(request));
                    SecurityContextHolder.getContext().setAuthentication(authToken);
                }
            }
        }

        // 6️⃣ Continue filter chain
        filterChain.doFilter(request, response);
    }
}