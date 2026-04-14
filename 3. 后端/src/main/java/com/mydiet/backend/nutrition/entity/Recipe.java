package com.mydiet.backend.nutrition.entity;

import jakarta.persistence.*;

@Entity
@Table(name = "recipes", catalog = "mydiet_nutrition")
public class Recipe {

    @Id
    private Integer id;

    private String name;

    @Column(name = "total_time")
    private String totalTime;

    @Column(name = "image_url", length = 600)
    private String imageUrl;

    private String category;

    @Column(columnDefinition = "JSON")
    private String keywords;

    @Column(columnDefinition = "JSON")
    private String ingredients;

    @Column(columnDefinition = "JSON")
    private String quantities;

    @Column(columnDefinition = "JSON")
    private String instructions;

    private Double calories;

    @Column(name = "fat_g")
    private Double fatG;

    @Column(name = "saturated_fat_g")
    private Double saturatedFatG;

    @Column(name = "cholesterol_mg")
    private Double cholesterolMg;

    @Column(name = "sodium_mg")
    private Double sodiumMg;

    @Column(name = "carbohydrate_g")
    private Double carbohydrateG;

    @Column(name = "fiber_g")
    private Double fiberG;

    @Column(name = "sugar_g")
    private Double sugarG;

    @Column(name = "protein_g")
    private Double proteinG;

    private Integer servings;

    @Column(name = "recipe_yield", length = 100)
    private String recipeYield;

    // ── Getters ──────────────────────────────────────────────

    public Integer getId() { return id; }
    public String getName() { return name; }
    public String getTotalTime() { return totalTime; }
    public String getImageUrl() { return imageUrl; }
    public String getCategory() { return category; }
    public String getKeywords() { return keywords; }
    public String getIngredients() { return ingredients; }
    public String getQuantities() { return quantities; }
    public String getInstructions() { return instructions; }
    public Double getCalories() { return calories; }
    public Double getFatG() { return fatG; }
    public Double getSaturatedFatG() { return saturatedFatG; }
    public Double getCholesterolMg() { return cholesterolMg; }
    public Double getSodiumMg() { return sodiumMg; }
    public Double getCarbohydrateG() { return carbohydrateG; }
    public Double getFiberG() { return fiberG; }
    public Double getSugarG() { return sugarG; }
    public Double getProteinG() { return proteinG; }
    public Integer getServings() { return servings; }
    public String getRecipeYield() { return recipeYield; }
}
