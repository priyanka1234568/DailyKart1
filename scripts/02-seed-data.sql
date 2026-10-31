-- Updated seed data with real product images
-- Updated for MySQL syntax
-- Insert categories
INSERT INTO categories (name, description) VALUES
('Fruits', 'Fresh and organic fruits'),
('Vegetables', 'Fresh green leafy vegetables'),
('Grains', 'Whole grains and cereals')
ON DUPLICATE KEY UPDATE name=name;

-- Insert sample products with real images
INSERT INTO products (name, description, price, quantity, category_id) VALUES
('Apple', 'Fresh red color full of proteins and vitamins A', 100.0, 13, (SELECT id FROM categories WHERE name = 'Fruits')),
('Lychees', 'Contain several healthy minerals, vitamins, and antioxidants', 70.5, 11, (SELECT id FROM categories WHERE name = 'Fruits')),
('Banana', 'Yellow color freshs banana full of ptassium and B12', 60.0, 28, (SELECT id FROM categories WHERE name = 'Fruits')),
('Oranges', 'Good source of Vitamins C and consume as juice', 50.0, 35, (SELECT id FROM categories WHERE name = 'Fruits')),
('Mango', 'Fresh sweet mango rich in vitamins and minerals', 150.0, 22, (SELECT id FROM categories WHERE name = 'Fruits')),
('Strawberry', 'Fresh red strawberries full of vitamin C', 70.0, 15, (SELECT id FROM categories WHERE name = 'Fruits')),
('Grapes', 'Fresh green grapes rich in antioxidants', 50.0, 20, (SELECT id FROM categories WHERE name = 'Fruits')),
('Pineapple', 'Sweet tropical fruit rich in bromelain', 90.0, 18, (SELECT id FROM categories WHERE name = 'Fruits')),
('Pomegranate', 'Ruby red seeds packed with antioxidants', 200.0, 16, (SELECT id FROM categories WHERE name = 'Fruits')),
('Watermelon', 'Juicy and refreshing summer fruit', 50.0, 30, (SELECT id FROM categories WHERE name = 'Fruits')),
('Papaya', 'Tropical fruit rich in vitamin C and A', 55.0, 14, (SELECT id FROM categories WHERE name = 'Fruits')),
('Guava', 'Tropical fruit rich in dietary fiber and vitamin C', 80.0, 12, (SELECT id FROM categories WHERE name = 'Fruits')),
('Kiwi', 'Vitamin C powerhouse with unique taste', 160.0, 17, (SELECT id FROM categories WHERE name = 'Fruits')),
('Cherry', 'Sweet red cherries packed with nutrients', 90.0, 19, (SELECT id FROM categories WHERE name = 'Fruits')),
('Potatoes', 'Its a rich source of potassium', 45.0, 25, (SELECT id FROM categories WHERE name = 'Vegetables')),
('Brinjal', 'Its a rich source of niacin, thiamin, vitamin C, riboflavin', 55.5, 35, (SELECT id FROM categories WHERE name = 'Vegetables')),
('Cabbage', 'Fresh green leafy vegetables', 38.5, 38, (SELECT id FROM categories WHERE name = 'Vegetables')),
('Spinach', 'Good source os proteins and Vitamins A', 25.0, 18, (SELECT id FROM categories WHERE name = 'Vegetables')),
('Tomatoes', 'Fresh red tomatoes rich in lycopene', 60.0, 32, (SELECT id FROM categories WHERE name = 'Vegetables')),
('Onions', 'White onions great for cooking', 40.0, 40, (SELECT id FROM categories WHERE name = 'Vegetables')),
('Carrots', 'Fresh orange carrots rich in beta-carotene', 70.0, 28, (SELECT id FROM categories WHERE name = 'Vegetables')),
('Bell Peppers', 'Colorful bell peppers packed with vitamin C', 80.0, 22, (SELECT id FROM categories WHERE name = 'Vegetables')),
('Cucumber', 'Fresh green cucumber perfect for salads', 35.0, 35, (SELECT id FROM categories WHERE name = 'Vegetables')),
('Cauliflower', 'Fresh white cauliflower nutritious vegetable', 65.0, 20, (SELECT id FROM categories WHERE name = 'Vegetables')),
('Broccoli', 'Green broccoli superfood vegetable', 75.0, 18, (SELECT id FROM categories WHERE name = 'Vegetables')),
('Green Beans', 'Fresh green beans rich in fiber', 50.0, 30, (SELECT id FROM categories WHERE name = 'Vegetables')),
('Peas', 'Fresh green peas sweet and nutritious', 55.0, 25, (SELECT id FROM categories WHERE name = 'Vegetables')),
('Lady Finger', 'Lady finger vegetable great for curry', 48.0, 22, (SELECT id FROM categories WHERE name = 'Vegetables')),
('Corn', 'Fresh sweet corn perfect for grilling', 42.0, 35, (SELECT id FROM categories WHERE name = 'Vegetables')),
('Corainder', 'Fresh green corainder rich in beta-carotene', 35.0, 28, (SELECT id FROM categories WHERE name = 'Vegetables')),
('Rice', 'High quality basmati rice', 120.0, 50, (SELECT id FROM categories WHERE name = 'Grains')),
('Wheat', 'Whole wheat grains', 80.0, 40, (SELECT id FROM categories WHERE name = 'Grains')),
('Barley', 'Whole grain barley nutritious and filling', 90.0, 35, (SELECT id FROM categories WHERE name = 'Grains')),
('Oats', 'Rolled oats perfect for breakfast', 85.0, 45, (SELECT id FROM categories WHERE name = 'Grains')),
('Mung Beans', 'Great source of plant-based protein and fiber', 60.0, 30, (SELECT id FROM categories WHERE name = 'Grains')),
('Matki', 'Benefit heart health, aid digestion, and boost immunity', 75.0, 38, (SELECT id FROM categories WHERE name = 'Grains')),
('Kabuli Chana', 'Promoting weight management and heart health while helping to regulate blood sugar', 85.0, 28, (SELECT id FROM categories WHERE name = 'Grains')),
('Corn Flour', 'Fine corn flour for cooking', 65.0, 42, (SELECT id FROM categories WHERE name = 'Grains')),
('Chana', 'Improved digestion, blood sugar regulation, and weight management', 70.0, 36, (SELECT id FROM categories WHERE name = 'Grains')),
('Dal', 'Promotes bone development and strengthens bone', 60.0, 36, (SELECT id FROM categories WHERE name = 'Grains')),
('Masoor Dal', 'Supporting heart health by lowering cholesterol and blood pressure', 66.0, 36, (SELECT id FROM categories WHERE name = 'Grains')),
('Chana Dal', 'Rich in protein and fiber, aiding in weight management, boosting digestion, stabilizing blood sugar', 70.0, 36, (SELECT id FROM categories WHERE name = 'Grains')),
('Rajma', 'High protein and fiber content, which aid in weight management and digestion', 80.0, 40, (SELECT id FROM categories WHERE name = 'Grains'))

ON DUPLICATE KEY UPDATE name=name;