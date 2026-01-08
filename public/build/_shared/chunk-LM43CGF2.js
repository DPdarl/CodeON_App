var e=[{id:"1.1",title:"Volume of Sphere",description:"Create a C# program that calculates the volume of a sphere. Use the formula V = (4/3) * \u03C0 * r\xB3, where r is the radius.",page:3,starterCode:`using System;

class Program
{
    static void Main(string[] args)
    {
        // Your code here to calculate the volume of a sphere
        // Ask the user to enter the radius
        // Calculate the volume
        // Display the result
    }
}`,hint:"Remember to convert user input from string to double using Convert.ToDouble() or double.Parse(), and use Math.PI and Math.Pow() for calculations.",solution:`using System;

class Program
{
    static void Main(string[] args)
    {
        Console.Write("Enter the radius of the sphere: ");
        double radius = Convert.ToDouble(Console.ReadLine());
        
        double volume = (4.0/3.0) * Math.PI * Math.Pow(radius, 3);
        
        Console.WriteLine($"The volume of a sphere with radius {radius} is {volume:F2} cubic units.");
    }
}`},{id:"1.2",title:"Temp Conversion",description:"Write a C# program that converts temperature from Celsius to Fahrenheit and vice versa. Use the formulas: F = (C * 9/5) + 32 and C = (F - 32) * 5/9.",page:4,starterCode:`using System;

class Program
{
    static void Main(string[] args)
    {
        // Write code to convert between Celsius and Fahrenheit
        // Ask the user which conversion they want to perform
        // Get the temperature value
        // Perform conversion and display result
    }
}`,hint:"Use a menu system with Console.ReadLine() to determine which conversion the user wants to perform. Remember to format the output to show only 2 decimal places.",solution:`using System;

class Program
{
    static void Main(string[] args)
    {
        Console.WriteLine("Temperature Conversion");
        Console.WriteLine("1. Celsius to Fahrenheit");
        Console.WriteLine("2. Fahrenheit to Celsius");
        Console.Write("Enter your choice (1 or 2): ");
        
        int choice = Convert.ToInt32(Console.ReadLine());
        
        if (choice == 1)
        {
            Console.Write("Enter temperature in Celsius: ");
            double celsius = Convert.ToDouble(Console.ReadLine());
            double fahrenheit = (celsius * 9/5) + 32;
            Console.WriteLine($"{celsius}\xB0C is equal to {fahrenheit:F2}\xB0F");
        }
        else if (choice == 2)
        {
            Console.Write("Enter temperature in Fahrenheit: ");
            double fahrenheit = Convert.ToDouble(Console.ReadLine());
            double celsius = (fahrenheit - 32) * 5/9;
            Console.WriteLine($"{fahrenheit}\xB0F is equal to {celsius:F2}\xB0C");
        }
        else
        {
            Console.WriteLine("Invalid choice!");
        }
    }
}`},{id:"1.3",title:"Peso-Dollar Conversion",description:"Create a C# program that converts between Philippine Pesos and US Dollars. Allow the user to convert in either direction using current exchange rates.",page:5,starterCode:`using System;

class Program
{
    static void Main(string[] args)
    {
        // Set the exchange rate (you can use any reasonable rate)
        // Create a menu for PHP to USD or USD to PHP conversion
        // Get user input and perform the conversion
        // Display the result with appropriate formatting
    }
}`,hint:"Define a constant for the exchange rate. Use string formatting to display currency values with 2 decimal places. Consider using the '$' string interpolation feature.",solution:`using System;

class Program
{
    static void Main(string[] args)
    {
        // Exchange rate (example value - can be updated)
        const double phpToUsdRate = 0.018;
        const double usdToPhpRate = 56.0;
        
        Console.WriteLine("Currency Converter");
        Console.WriteLine("1. PHP to USD");
        Console.WriteLine("2. USD to PHP");
        Console.Write("Enter your choice (1 or 2): ");
        
        int choice = Convert.ToInt32(Console.ReadLine());
        
        if (choice == 1)
        {
            Console.Write("Enter amount in PHP: ");
            double php = Convert.ToDouble(Console.ReadLine());
            double usd = php * phpToUsdRate;
            Console.WriteLine($"{php:F2} PHP = {usd:F2} USD");
        }
        else if (choice == 2)
        {
            Console.Write("Enter amount in USD: ");
            double usd = Convert.ToDouble(Console.ReadLine());
            double php = usd * usdToPhpRate;
            Console.WriteLine($"{usd:F2} USD = {php:F2} PHP");
        }
        else
        {
            Console.WriteLine("Invalid choice!");
        }
    }
}`},{id:"1.4",title:"Measurement Conversion",description:"Write a C# program that converts between different units of measurement (e.g., meters to feet, kilograms to pounds, etc.).",page:6,starterCode:`using System;

class Program
{
    static void Main(string[] args)
    {
        // Create a menu of conversion options
        // Get user input for which conversion to perform
        // Implement at least 3 different measurement conversions
        // Display results with appropriate units
    }
}`,hint:"Common conversion factors: 1 meter = 3.28084 feet, 1 kilogram = 2.20462 pounds, 1 liter = 0.264172 gallons. Use switch statements to handle the different conversion options.",solution:`using System;

class Program
{
    static void Main(string[] args)
    {
        Console.WriteLine("Measurement Converter");
        Console.WriteLine("1. Meters to Feet");
        Console.WriteLine("2. Kilograms to Pounds");
        Console.WriteLine("3. Liters to Gallons");
        Console.Write("Enter your choice (1-3): ");
        
        int choice = Convert.ToInt32(Console.ReadLine());
        
        switch (choice)
        {
            case 1:
                Console.Write("Enter length in meters: ");
                double meters = Convert.ToDouble(Console.ReadLine());
                double feet = meters * 3.28084;
                Console.WriteLine($"{meters} meters = {feet:F2} feet");
                break;
                
            case 2:
                Console.Write("Enter weight in kilograms: ");
                double kg = Convert.ToDouble(Console.ReadLine());
                double pounds = kg * 2.20462;
                Console.WriteLine($"{kg} kilograms = {pounds:F2} pounds");
                break;
                
            case 3:
                Console.Write("Enter volume in liters: ");
                double liters = Convert.ToDouble(Console.ReadLine());
                double gallons = liters * 0.264172;
                Console.WriteLine($"{liters} liters = {gallons:F2} gallons");
                break;
                
            default:
                Console.WriteLine("Invalid choice!");
                break;
        }
    }
}`},{id:"1.5",title:"Two Variables",description:"Create a C# program that demonstrates the use of two variables. Perform various operations (addition, subtraction, multiplication, division) on these variables.",page:7,starterCode:`using System;

class Program
{
    static void Main(string[] args)
    {
        // Declare two variables and assign values to them
        // Perform and display the results of various operations
        // Remember to handle potential division by zero
    }
}`,hint:"Use descriptive variable names. When dividing, check if the divisor is zero to avoid runtime errors. Use Console.WriteLine() to display results of each operation.",solution:`using System;

class Program
{
    static void Main(string[] args)
    {
        // Declare and initialize two variables
        Console.Write("Enter first number: ");
        double num1 = Convert.ToDouble(Console.ReadLine());
        
        Console.Write("Enter second number: ");
        double num2 = Convert.ToDouble(Console.ReadLine());
        
        // Addition
        double sum = num1 + num2;
        Console.WriteLine($"Addition: {num1} + {num2} = {sum}");
        
        // Subtraction
        double difference = num1 - num2;
        Console.WriteLine($"Subtraction: {num1} - {num2} = {difference}");
        
        // Multiplication
        double product = num1 * num2;
        Console.WriteLine($"Multiplication: {num1} * {num2} = {product}");
        
        // Division (with check for division by zero)
        if (num2 != 0)
        {
            double quotient = num1 / num2;
            Console.WriteLine($"Division: {num1} / {num2} = {quotient:F2}");
        }
        else
        {
            Console.WriteLine("Division by zero is not allowed.");
        }
    }
}`},{id:"1.6",title:"Circumference of a circle",description:"Write a C# program that calculates the circumference of a circle. Use the formula C = 2\u03C0r, where r is the radius.",page:8,starterCode:`using System;

class Program
{
    static void Main(string[] args)
    {
        // Get the radius from the user
        // Calculate the circumference
        // Display the result
    }
}`,hint:"Use Math.PI for the value of \u03C0. Format the output to display only two decimal places using the :F2 format specifier in string interpolation.",solution:`using System;

class Program
{
    static void Main(string[] args)
    {
        Console.Write("Enter the radius of the circle: ");
        double radius = Convert.ToDouble(Console.ReadLine());
        
        double circumference = 2 * Math.PI * radius;
        
        Console.WriteLine($"The circumference of a circle with radius {radius} is {circumference:F2} units.");
    }
}`},{id:"1.7",title:"Three variables declaration",description:"Create a C# program that declares and uses three different types of variables (int, double, string). Demonstrate type conversion between these variables.",page:9,starterCode:`using System;

class Program
{
    static void Main(string[] args)
    {
        // Declare variables of different types (int, double, string)
        // Perform type conversions between them
        // Display the values and types before and after conversion
    }
}`,hint:"Use Convert.ToInt32(), Convert.ToDouble(), or ToString() methods for type conversion. You can also use the GetType() method to display the type of a variable.",solution:`using System;

class Program
{
    static void Main(string[] args)
    {
        // Declare variables of different types
        int intValue = 42;
        double doubleValue = 3.14159;
        string stringValue = "100";
        
        Console.WriteLine("Original values:");
        Console.WriteLine($"intValue: {intValue} (Type: {intValue.GetType()})");
        Console.WriteLine($"doubleValue: {doubleValue} (Type: {doubleValue.GetType()})");
        Console.WriteLine($"stringValue: {stringValue} (Type: {stringValue.GetType()})");
        
        Console.WriteLine("\\nConverting int to double:");
        double intToDouble = intValue; // Implicit conversion
        Console.WriteLine($"intToDouble: {intToDouble} (Type: {intToDouble.GetType()})");
        
        Console.WriteLine("\\nConverting double to int:");
        int doubleToInt = (int)doubleValue; // Explicit conversion / casting
        Console.WriteLine($"doubleToInt: {doubleToInt} (Type: {doubleToInt.GetType()})");
        
        Console.WriteLine("\\nConverting string to int:");
        int stringToInt = Convert.ToInt32(stringValue);
        Console.WriteLine($"stringToInt: {stringToInt} (Type: {stringToInt.GetType()})");
        
        Console.WriteLine("\\nConverting int to string:");
        string intToString = intValue.ToString();
        Console.WriteLine($"intToString: {intToString} (Type: {intToString.GetType()})");
    }
}`},{id:"1.8",title:"Purchase Price",description:"Write a C# program that calculates the final purchase price including tax. Ask the user for the item price and tax rate, then calculate and display the total.",page:10,starterCode:`using System;

class Program
{
    static void Main(string[] args)
    {
        // Get item price and tax rate from the user
        // Calculate the tax amount
        // Calculate and display the total price
    }
}`,hint:"Tax amount is calculated as price * (taxRate / 100). The final price is the original price plus the tax amount. Use appropriate formatting for currency values.",solution:`using System;

class Program
{
    static void Main(string[] args)
    {
        Console.Write("Enter the item price: $");
        double price = Convert.ToDouble(Console.ReadLine());
        
        Console.Write("Enter the tax rate (%): ");
        double taxRate = Convert.ToDouble(Console.ReadLine());
        
        double taxAmount = price * (taxRate / 100);
        double totalPrice = price + taxAmount;
        
        Console.WriteLine($"Original price: \${price:F2}");
        Console.WriteLine($"Tax amount ({taxRate}%): \${taxAmount:F2}");
        Console.WriteLine($"Total price: \${totalPrice:F2}");
    }
}`},{id:"1.9",title:"Economic order quantity",description:"Create a C# program that calculates the Economic Order Quantity (EOQ) using the formula EOQ = sqrt((2 * D * S) / H), where D is annual demand, S is order cost, and H is holding cost.",page:11,starterCode:`using System;

class Program
{
    static void Main(string[] args)
    {
        // Get the annual demand, order cost, and holding cost from the user
        // Calculate the EOQ using the formula
        // Display the result
    }
}`,hint:"Use Math.Sqrt() to calculate the square root. Validate that the input values are positive before performing the calculation.",solution:`using System;

class Program
{
    static void Main(string[] args)
    {
        Console.Write("Enter annual demand (D): ");
        double demand = Convert.ToDouble(Console.ReadLine());
        
        Console.Write("Enter order cost (S): $");
        double orderCost = Convert.ToDouble(Console.ReadLine());
        
        Console.Write("Enter annual holding cost per unit (H): $");
        double holdingCost = Convert.ToDouble(Console.ReadLine());
        
        if (demand <= 0 || orderCost <= 0 || holdingCost <= 0)
        {
            Console.WriteLine("Error: All values must be positive.");
        }
        else
        {
            double eoq = Math.Sqrt((2 * demand * orderCost) / holdingCost);
            Console.WriteLine($"The Economic Order Quantity (EOQ) is: {eoq:F2} units");
        }
    }
}`},{id:"1.10",title:"Radius of a circle",description:"Write a C# program that calculates the radius of a circle when given its area. Use the formula r = sqrt(A / \u03C0), where A is the area.",page:12,starterCode:`using System;

class Program
{
    static void Main(string[] args)
    {
        // Get the area of the circle from the user
        // Calculate the radius
        // Display the result
    }
}`,hint:"Use Math.PI for the value of \u03C0 and Math.Sqrt() for the square root calculation. Make sure to handle negative input values appropriately.",solution:`using System;

class Program
{
    static void Main(string[] args)
    {
        Console.Write("Enter the area of the circle: ");
        double area = Convert.ToDouble(Console.ReadLine());
        
        if (area <= 0)
        {
            Console.WriteLine("Error: Area must be positive.");
        }
        else
        {
            double radius = Math.Sqrt(area / Math.PI);
            Console.WriteLine($"The radius of a circle with area {area} is {radius:F4} units.");
        }
    }
}`}];export{e as a};
