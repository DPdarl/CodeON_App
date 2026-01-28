-- 1. Updates Schema to include Rewards
ALTER TABLE public.challenges 
ADD COLUMN IF NOT EXISTS xp_reward integer DEFAULT 20,
ADD COLUMN IF NOT EXISTS coins_reward integer DEFAULT 5;

-- 2. Upsert Data with Balanced Rewards
-- Logic: Easy = 20 XP / 5 Coins, Medium = 30 XP / 10 Coins, Hard = 50 XP / 20 Coins
-- Difficulty is inferred from ID or Title if not explicit, but based on previous interaction:
-- 1.1 Easy, 1.2 Medium, 1.3 Medium, 1.4 Medium, 1.5 Easy, 1.6 Easy, 1.7 Easy, 1.8 Easy, 1.9 Hard, 1.10 Easy.

INSERT INTO public.challenges (id, title, description, page, starter_code, hint, solution, language, xp_reward, coins_reward)
VALUES
(
  '1.1', 
  'Volume of Sphere', 
  'Create a C# program that calculates the volume of a sphere. Use the formula V = (4/3) * π * r³, where r is the radius.', 
  3,
  'using System;\r\n\r\nclass Program\r\n{\r\n    static void Main(string[] args)\r\n    {\r\n        // Your code here to calculate the volume of a sphere\r\n        // Ask the user to enter the radius\r\n        // Calculate the volume\r\n        // Display the result\r\n    }\r\n}',
  'Remember to convert user input from string to double using Convert.ToDouble() or double.Parse(), and use Math.PI and Math.Pow() for calculations.',
  'using System;\r\n\r\nclass Program\r\n{\r\n    static void Main(string[] args)\r\n    {\r\n        Console.Write("Enter the radius of the sphere: ");\r\n        double radius = Convert.ToDouble(Console.ReadLine());\r\n        \r\n        double volume = (4.0/3.0) * Math.PI * Math.Pow(radius, 3);\r\n        \r\n        Console.WriteLine($"The volume of a sphere with radius {radius} is {volume:F2} cubic units.");\r\n    }\r\n}',
  'csharp',
  20, 5
),
(
  '1.2', 
  'Temp Conversion', 
  'Write a C# program that converts temperature from Celsius to Fahrenheit and vice versa. Use the formulas: F = (C * 9/5) + 32 and C = (F - 32) * 5/9.', 
  4,
  'using System;\r\n\r\nclass Program\r\n{\r\n    static void Main(string[] args)\r\n    {\r\n        // Write code to convert between Celsius and Fahrenheit\r\n        // Ask the user which conversion they want to perform\r\n        // Get the temperature value\r\n        // Perform conversion and display result\r\n    }\r\n}',
  'Use a menu system with Console.ReadLine() to determine which conversion the user wants to perform. Remember to format the output to show only 2 decimal places.',
  'using System;\r\n\r\nclass Program\r\n{\r\n    static void Main(string[] args)\r\n    {\r\n        Console.WriteLine("Temperature Conversion");\r\n        Console.WriteLine("1. Celsius to Fahrenheit");\r\n        Console.WriteLine("2. Fahrenheit to Celsius");\r\n        Console.Write("Enter your choice (1 or 2): ");\r\n        \r\n        int choice = Convert.ToInt32(Console.ReadLine());\r\n        \r\n        if (choice == 1)\r\n        {\r\n            Console.Write("Enter temperature in Celsius: ");\r\n            double celsius = Convert.ToDouble(Console.ReadLine());\r\n            double fahrenheit = (celsius * 9/5) + 32;\r\n            Console.WriteLine($"{celsius}°C is equal to {fahrenheit:F2}°F");\r\n        }\r\n        else if (choice == 2)\r\n        {\r\n            Console.Write("Enter temperature in Fahrenheit: ");\r\n            double fahrenheit = Convert.ToDouble(Console.ReadLine());\r\n            double celsius = (fahrenheit - 32) * 5/9;\r\n            Console.WriteLine($"{fahrenheit}°F is equal to {celsius:F2}°C");\r\n        }\r\n        else\r\n        {\r\n            Console.WriteLine("Invalid choice!");\r\n        }\r\n    }\r\n}',
  'csharp',
  30, 10
),
(
  '1.3', 
  'Peso-Dollar Conversion', 
  'Create a C# program that converts between Philippine Pesos and US Dollars. Allow the user to convert in either direction using current exchange rates.', 
  5,
  'using System;\r\n\r\nclass Program\r\n{\r\n    static void Main(string[] args)\r\n    {\r\n        // Set the exchange rate (you can use any reasonable rate)\r\n        // Create a menu for PHP to USD or USD to PHP conversion\r\n        // Get user input and perform the conversion\r\n        // Display the result with appropriate formatting\r\n    }\r\n}',
  'Define a constant for the exchange rate. Use string formatting to display currency values with 2 decimal places. Consider using the "$ " string interpolation feature.',
  'using System;\r\n\r\nclass Program\r\n{\r\n    static void Main(string[] args)\r\n    {\r\n        // Exchange rate (example value - can be updated)\r\n        const double phpToUsdRate = 0.018;\r\n        const double usdToPhpRate = 56.0;\r\n        \r\n        Console.WriteLine("Currency Converter");\r\n        Console.WriteLine("1. PHP to USD");\r\n        Console.WriteLine("2. USD to PHP");\r\n        Console.Write("Enter your choice (1 or 2): ");\r\n        \r\n        int choice = Convert.ToInt32(Console.ReadLine());\r\n        \r\n        if (choice == 1)\r\n        {\r\n            Console.Write("Enter amount in PHP: ");\r\n            double php = Convert.ToDouble(Console.ReadLine());\r\n            double usd = php * phpToUsdRate;\r\n            Console.WriteLine($"{php:F2} PHP = {usd:F2} USD");\r\n        }\r\n        else if (choice == 2)\r\n        {\r\n            Console.Write("Enter amount in USD: ");\r\n            double usd = Convert.ToDouble(Console.ReadLine());\r\n            double php = usd * usdToPhpRate;\r\n            Console.WriteLine($"{usd:F2} USD = {php:F2} PHP");\r\n        }\r\n        else\r\n        {\r\n            Console.WriteLine("Invalid choice!");\r\n        }\r\n    }\r\n}',
  'csharp',
  30, 10
),
(
  '1.4', 
  'Measurement Conversion', 
  'Write a C# program that converts between different units of measurement (e.g., meters to feet, kilograms to pounds, etc.).', 
  6,
  'using System;\r\n\r\nclass Program\r\n{\r\n    static void Main(string[] args)\r\n    {\r\n        // Create a menu of conversion options\r\n        // Get user input for which conversion to perform\r\n        // Implement at least 3 different measurement conversions\r\n        // Display results with appropriate units\r\n    }\r\n}',
  'Common conversion factors: 1 meter = 3.28084 feet, 1 kilogram = 2.20462 pounds, 1 liter = 0.264172 gallons. Use switch statements to handle the different conversion options.',
  'using System;\r\n\r\nclass Program\r\n{\r\n    static void Main(string[] args)\r\n    {\r\n        Console.WriteLine("Measurement Converter");\r\n        Console.WriteLine("1. Meters to Feet");\r\n        Console.WriteLine("2. Kilograms to Pounds");\r\n        Console.WriteLine("3. Liters to Gallons");\r\n        Console.Write("Enter your choice (1-3): ");\r\n        \r\n        int choice = Convert.ToInt32(Console.ReadLine());\r\n        \r\n        switch (choice)\r\n        {\r\n            case 1:\r\n                Console.Write("Enter length in meters: ");\r\n                double meters = Convert.ToDouble(Console.ReadLine());\r\n                double feet = meters * 3.28084;\r\n                Console.WriteLine($"{meters} meters = {feet:F2} feet");\r\n                break;\r\n                \r\n            case 2:\r\n                Console.Write("Enter weight in kilograms: ");\r\n                double kg = Convert.ToDouble(Console.ReadLine());\r\n                double pounds = kg * 2.20462;\r\n                Console.WriteLine($"{kg} kilograms = {pounds:F2} pounds");\r\n                break;\r\n                \r\n            case 3:\r\n                Console.Write("Enter volume in liters: ");\r\n                double liters = Convert.ToDouble(Console.ReadLine());\r\n                double gallons = liters * 0.264172;\r\n                Console.WriteLine($"{liters} liters = {gallons:F2} gallons");\r\n                break;\r\n                \r\n            default:\r\n                Console.WriteLine("Invalid choice!");\r\n                break;\r\n        }\r\n    }\r\n}',
  'csharp',
  30, 10
),
(
  '1.5', 
  'Two Variables', 
  'Create a C# program that demonstrates the use of two variables. Perform various operations (addition, subtraction, multiplication, division) on these variables.', 
  7,
  'using System;\r\n\r\nclass Program\r\n{\r\n    static void Main(string[] args)\r\n    {\r\n        // Declare two variables and assign values to them\r\n        // Perform and display the results of various operations\r\n        // Remember to handle potential division by zero\r\n    }\r\n}',
  'Use descriptive variable names. When dividing, check if the divisor is zero to avoid runtime errors. Use Console.WriteLine() to display results of each operation.',
  'using System;\r\n\r\nclass Program\r\n{\r\n    static void Main(string[] args)\r\n    {\r\n        // Declare and initialize two variables\r\n        Console.Write("Enter first number: ");\r\n        double num1 = Convert.ToDouble(Console.ReadLine());\r\n        \r\n        Console.Write("Enter second number: ");\r\n        double num2 = Convert.ToDouble(Console.ReadLine());\r\n        \r\n        // Addition\r\n        double sum = num1 + num2;\r\n        Console.WriteLine($"Addition: {num1} + {num2} = {sum}");\r\n        \r\n        // Subtraction\r\n        double difference = num1 - num2;\r\n        Console.WriteLine($"Subtraction: {num1} - {num2} = {difference}");\r\n        \r\n        // Multiplication\r\n        double product = num1 * num2;\r\n        Console.WriteLine($"Multiplication: {num1} * {num2} = {product}");\r\n        \r\n        // Division (with check for division by zero)\r\n        if (num2 != 0)\r\n        {\r\n            double quotient = num1 / num2;\r\n            Console.WriteLine($"Division: {num1} / {num2} = {quotient:F2}");\r\n        }\r\n        else\r\n        {\r\n            Console.WriteLine("Division by zero is not allowed.");\r\n        }\r\n    }\r\n}',
  'csharp',
  20, 5
),
(
  '1.6', 
  'Circumference of a circle', 
  'Write a C# program that calculates the circumference of a circle. Use the formula C = 2πr, where r is the radius.', 
  8,
  'using System;\r\n\r\nclass Program\r\n{\r\n    static void Main(string[] args)\r\n    {\r\n        // Get the radius from the user\r\n        // Calculate the circumference\r\n        // Display the result\r\n    }\r\n}',
  'Use Math.PI for the value of π. Format the output to display only two decimal places using the :F2 format specifier in string interpolation.',
  'using System;\r\n\r\nclass Program\r\n{\r\n    static void Main(string[] args)\r\n    {\r\n        Console.Write("Enter the radius of the circle: ");\r\n        double radius = Convert.ToDouble(Console.ReadLine());\r\n        \r\n        double circumference = 2 * Math.PI * radius;\r\n        \r\n        Console.WriteLine($"The circumference of a circle with radius {radius} is {circumference:F2} units.");\r\n    }\r\n}',
  'csharp',
  20, 5
),
(
  '1.7', 
  'Three variables declaration', 
  'Create a C# program that declares and uses three different types of variables (int, double, string). Demonstrate type conversion between these variables.', 
  9,
  'using System;\r\n\r\nclass Program\r\n{\r\n    static void Main(string[] args)\r\n    {\r\n        // Declare variables of different types (int, double, string)\r\n        // Perform type conversions between them\r\n        // Display the values and types before and after conversion\r\n    }\r\n}',
  'Use Convert.ToInt32(), Convert.ToDouble(), or ToString() methods for type conversion. You can also use the GetType() method to display the type of a variable.',
  'using System;\r\n\r\nclass Program\r\n{\r\n    static void Main(string[] args)\r\n    {\r\n        // Declare variables of different types\r\n        int intValue = 42;\r\n        double doubleValue = 3.14159;\r\n        string stringValue = "100";\r\n        \r\n        Console.WriteLine("Original values:");\r\n        Console.WriteLine($"intValue: {intValue} (Type: {intValue.GetType()})");\r\n        Console.WriteLine($"doubleValue: {doubleValue} (Type: {doubleValue.GetType()})");\r\n        Console.WriteLine($"stringValue: {stringValue} (Type: {stringValue.GetType()})");\r\n        \r\n        Console.WriteLine("\\nConverting int to double:");\r\n        double intToDouble = intValue; // Implicit conversion\r\n        Console.WriteLine($"intToDouble: {intToDouble} (Type: {intToDouble.GetType()})");\r\n        \r\n        Console.WriteLine("\\nConverting double to int:");\r\n        int doubleToInt = (int)doubleValue; // Explicit conversion / casting\r\n        Console.WriteLine($"doubleToInt: {doubleToInt} (Type: {doubleToInt.GetType()})");\r\n        \r\n        Console.WriteLine("\\nConverting string to int:");\r\n        int stringToInt = Convert.ToInt32(stringValue);\r\n        Console.WriteLine($"stringToInt: {stringToInt} (Type: {stringToInt.GetType()})");\r\n        \r\n        Console.WriteLine("\\nConverting int to string:");\r\n        string intToString = intValue.ToString();\r\n        Console.WriteLine($"intToString: {intToString} (Type: {intToString.GetType()})");\r\n    }\r\n}',
  'csharp',
  20, 5
),
(
  '1.8', 
  'Purchase Price', 
  'Write a C# program that calculates the final purchase price including tax. Ask the user for the item price and tax rate, then calculate and display the total.', 
  10,
  'using System;\r\n\r\nclass Program\r\n{\r\n    static void Main(string[] args)\r\n    {\r\n        // Get item price and tax rate from the user\r\n        // Calculate the tax amount\r\n        // Calculate and display the total price\r\n    }\r\n}',
  'Tax amount is calculated as price * (taxRate / 100). The final price is the original price plus the tax amount. Use appropriate formatting for currency values.',
  'using System;\r\n\r\nclass Program\r\n{\r\n    static void Main(string[] args)\r\n    {\r\n        Console.Write("Enter the item price: $");\r\n        double price = Convert.ToDouble(Console.ReadLine());\r\n        \r\n        Console.Write("Enter the tax rate (%): ");\r\n        double taxRate = Convert.ToDouble(Console.ReadLine());\r\n        \r\n        double taxAmount = price * (taxRate / 100);\r\n        double totalPrice = price + taxAmount;\r\n        \r\n        Console.WriteLine($"Original price: ${price:F2}");\r\n        Console.WriteLine($"Tax amount ({taxRate}%): ${taxAmount:F2}");\r\n        Console.WriteLine($"Total price: ${totalPrice:F2}");\r\n    }\r\n}',
  'csharp',
  20, 5
),
(
  '1.9', 
  'Economic order quantity', 
  'Create a C# program that calculates the Economic Order Quantity (EOQ) using the formula EOQ = sqrt((2 * D * S) / H), where D is annual demand, S is order cost, and H is holding cost.', 
  11,
  'using System;\r\n\r\nclass Program\r\n{\r\n    static void Main(string[] args)\r\n    {\r\n        // Get the annual demand, order cost, and holding cost from the user\r\n        // Calculate the EOQ using the formula\r\n        // Display the result\r\n    }\r\n}',
  'Use Math.Sqrt() to calculate the square root. Validate that the input values are positive before performing the calculation.',
  'using System;\r\n\r\nclass Program\r\n{\r\n    static void Main(string[] args)\r\n    {\r\n        Console.Write("Enter annual demand (D): ");\r\n        double demand = Convert.ToDouble(Console.ReadLine());\r\n        \r\n        Console.Write("Enter order cost (S): $");\r\n        double orderCost = Convert.ToDouble(Console.ReadLine());\r\n        \r\n        Console.Write("Enter annual holding cost per unit (H): $");\r\n        double holdingCost = Convert.ToDouble(Console.ReadLine());\r\n        \r\n        if (demand <= 0 || orderCost <= 0 || holdingCost <= 0)\r\n        {\r\n            Console.WriteLine("Error: All values must be positive.");\r\n        }\r\n        else\r\n        {\r\n            double eoq = Math.Sqrt((2 * demand * orderCost) / holdingCost);\r\n            Console.WriteLine($"The Economic Order Quantity (EOQ) is: {eoq:F2} units");\r\n        }\r\n    }\r\n}',
  'csharp',
  50, 20
),
(
  '1.10', 
  'Radius of a circle', 
  'Write a C# program that calculates the radius of a circle when given its area. Use the formula r = sqrt(A / π), where A is the area.', 
  12,
  'using System;\r\n\r\nclass Program\r\n{\r\n    static void Main(string[] args)\r\n    {\r\n        // Get the area of the circle from the user\r\n        // Calculate the radius\r\n        // Display the result\r\n    }\r\n}',
  'Use Math.PI for the value of π and Math.Sqrt() for the square root calculation. Make sure to handle negative input values appropriately.',
  'using System;\r\n\r\nclass Program\r\n{\r\n    static void Main(string[] args)\r\n    {\r\n        Console.Write("Enter the area of the circle: ");\r\n        double area = Convert.ToDouble(Console.ReadLine());\r\n        \r\n        if (area <= 0)\r\n        {\r\n            Console.WriteLine("Error: Area must be positive.");\r\n        }\r\n        else\r\n        {\r\n            double radius = Math.Sqrt(area / Math.PI);\r\n            Console.WriteLine($"The radius of a circle with area {area} is {radius:F4} units.");\r\n        }\r\n    }\r\n}',
  'csharp',
  20, 5
)
ON CONFLICT (id) DO UPDATE SET
  title = EXCLUDED.title,
  description = EXCLUDED.description,
  page = EXCLUDED.page,
  starter_code = EXCLUDED.starter_code,
  hint = EXCLUDED.hint,
  solution = EXCLUDED.solution,
  language = EXCLUDED.language,
  xp_reward = EXCLUDED.xp_reward,
  coins_reward = EXCLUDED.coins_reward;
