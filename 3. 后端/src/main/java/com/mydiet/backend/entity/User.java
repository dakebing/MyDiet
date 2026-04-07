package com.mydiet.backend.entity;

import jakarta.persistence.*;
import lombok.Data;

import java.time.LocalDateTime;

@Data
@Entity
@Table(name = "users")
public class User {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true)
    private String email;

    @Column
    private String password;

    @Column(nullable = false)
    private String username;

    @Column(nullable = false)
    private String provider;

    @Column(name = "provider_user_id")
    private String providerUserId;

    @Column(name = "avatar_url")
    private String avatarUrl;

    @Column(name = "avatar_gradient")
    private String avatarGradient;

    @Column(name = "created_at", insertable = false, updatable = false)
    private LocalDateTime createdAt;
}