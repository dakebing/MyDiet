package com.mydiet.backend.nutrition.dto;

public class RecipeDTO {
    private String id;
    private String name;
    private double calories;
    private double protein;
    private double carbs;
    private double fats;
    private String image;
    private String category;

    public RecipeDTO() {}

    public RecipeDTO(Integer id, String name, Double calories, Double protein,
                     Double carbs, Double fats, String image, String category) {
        this.id = id == null ? "" : String.valueOf(id);
        this.name = name;
        this.calories = calories != null ? calories : 0;
        this.protein = protein != null ? protein : 0;
        this.carbs = carbs != null ? carbs : 0;
        this.fats = fats != null ? fats : 0;
        this.image = image;
        this.category = category;
    }

    public String getId() { return id; }
    public void setId(String id) { this.id = id; }

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }

    public double getCalories() { return calories; }
    public void setCalories(double calories) { this.calories = calories; }

    public double getProtein() { return protein; }
    public void setProtein(double protein) { this.protein = protein; }

    public double getCarbs() { return carbs; }
    public void setCarbs(double carbs) { this.carbs = carbs; }

    public double getFats() { return fats; }
    public void setFats(double fats) { this.fats = fats; }

    public String getImage() { return image; }
    public void setImage(String image) { this.image = image; }

    public String getCategory() { return category; }
    public void setCategory(String category) { this.category = category; }
}
