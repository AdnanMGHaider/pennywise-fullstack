package com.pennywise.pennywisebackend.model;

import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

@Entity
@Data
@NoArgsConstructor
@AllArgsConstructor
@Table(name = "categories")
public class Category {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(unique = true, nullable = false)
    private String name;

    // Optional: Add type if categories can be for 'income', 'expense', 'goal', etc.
    // private String type;

    // Optional: User relationship if categories are user-specific
    // @ManyToOne
    // @JoinColumn(name = "user_id")
    // private User user;

    public Category(String name) {
        this.name = name;
    }
}
