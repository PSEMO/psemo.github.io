// jobs-data.js
var Jobs = [
    {
        CompanyType: "Adult Novelties",
        Positions:
            [
                { roleName: "HR Officer", minMAN: 0, minEND: 6000, minINT: 12000 },
                { roleName: "Sexpert", minMAN: 0, minEND: 5000, minINT: 10000 },
                { roleName: "Store Manager", minMAN: 0, minEND: 8000, minINT: 4000 },
                { roleName: "Marketing Manager", minMAN: 0, minEND: 4000, minINT: 8000 },
                { roleName: "Receptionist", minMAN: 0, minEND: 6000, minINT: 3000 },
                { roleName: "Sales Assistant", minMAN: 2000, minEND: 4000, minINT: 0 },
                { roleName: "Cleaner", minMAN: 2000, minEND: 1000, minINT: 0 }
            ]
    },
    {
        CompanyType: "Amusement Park",
        Positions:
            [
                { roleName: "Inspector", minMAN: 0, minEND: 67500, minINT: 135000 },
                { roleName: "Manager", minMAN: 0, minEND: 90000, minINT: 45000 },
                { roleName: "Marketer", minMAN: 0, minEND: 45000, minINT: 90000 },
                { roleName: "Security Guard", minMAN: 79000, minEND: 39500, minINT: 0 },
                { roleName: "Mechanic", minMAN: 67500, minEND: 0, minINT: 33750 },
                { roleName: "Accountant", minMAN: 0, minEND: 67500, minINT: 33750 },
                { roleName: "Ride Attendant", minMAN: 0, minEND: 45000, minINT: 22500 },
                { roleName: "Entertainer", minMAN: 34000, minEND: 17000, minINT: 0 },
                { roleName: "Ticket Agent", minMAN: 0, minEND: 22500, minINT: 11250 },
                { roleName: "Janitor", minMAN: 22500, minEND: 11250, minINT: 0 }
            ]
    },
    {
        CompanyType: "Candle Shop",
        Positions:
            [
                { roleName: "Chandler", minMAN: 4500, minEND: 0, minINT: 2250 },
                { roleName: "Trainer", minMAN: 0, minEND: 2250, minINT: 4500 },
                { roleName: "Quality Controller", minMAN: 0, minEND: 3000, minINT: 1500 },
                { roleName: "Bookkeeper", minMAN: 0, minEND: 2500, minINT: 1250 },
                { roleName: "Salesperson", minMAN: 0, minEND: 1500, minINT: 750 },
                { roleName: "Cleaner", minMAN: 1000, minEND: 500, minINT: 0 }
            ]
    },
    {
        CompanyType: "Car Dealership",
        Positions:
            [
                { roleName: "Training Adviser", minMAN: 0, minEND: 31500, minINT: 63000 },
                { roleName: "Manager", minMAN: 0, minEND: 42000, minINT: 21000 },
                { roleName: "Webmaster", minMAN: 0, minEND: 21000, minINT: 42000 },
                { roleName: "Receptionist", minMAN: 0, minEND: 31500, minINT: 15750 },
                { roleName: "Mechanic", minMAN: 26500, minEND: 13250, minINT: 0 },
                { roleName: "Sales Executive", minMAN: 0, minEND: 10500, minINT: 21000 },
                { roleName: "Cleaner", minMAN: 10500, minEND: 5250, minINT: 0 },
                { roleName: "Sales Apprentice", minMAN: 0, minEND: 2750, minINT: 5500 }
            ]
    },
    {
        CompanyType: "Clothing Store",
        Positions:
            [
                { roleName: "Line Manager", minMAN: 0, minEND: 3000, minINT: 6000 },
                { roleName: "Store Manager", minMAN: 0, minEND: 4000, minINT: 2000 },
                { roleName: "Marketing Manager", minMAN: 0, minEND: 2000, minINT: 4000 },
                { roleName: "Accountant", minMAN: 0, minEND: 3000, minINT: 1500 },
                { roleName: "Security Guard", minMAN: 3000, minEND: 1500, minINT: 0 },
                { roleName: "Salesperson", minMAN: 0, minEND: 1000, minINT: 2000 },
                { roleName: "Cashier", minMAN: 750, minEND: 1500, minINT: 0 },
                { roleName: "Cleaner", minMAN: 1000, minEND: 500, minINT: 0 },
                { roleName: "Sales Trainee", minMAN: 0, minEND: 250, minINT: 500 }
            ]
    },
    {
        CompanyType: "Cruise Line",
        Positions:
            [
                { roleName: "Captain", minMAN: 0, minEND: 77250, minINT: 154500 },
                { roleName: "First Officer", minMAN: 0, minEND: 52500, minINT: 105000 },
                { roleName: "Doctor", minMAN: 0, minEND: 51500, minINT: 103000 },
                { roleName: "Specialist", minMAN: 0, minEND: 45000, minINT: 90000 },
                { roleName: "Bosun", minMAN: 0, minEND: 74000, minINT: 37000 },
                { roleName: "Marketer", minMAN: 0, minEND: 36000, minINT: 72000 },
                { roleName: "Chef", minMAN: 0, minEND: 32250, minINT: 64500 },
                { roleName: "Engineer", minMAN: 54500, minEND: 0, minINT: 27250 },
                { roleName: "Receptionist", minMAN: 0, minEND: 42000, minINT: 21000 },
                { roleName: "Steward", minMAN: 0, minEND: 41500, minINT: 20750 },
                { roleName: "Bartender", minMAN: 19250, minEND: 38500, minINT: 0 },
                { roleName: "Deckhand", minMAN: 26000, minEND: 13000, minINT: 0 },
                { roleName: "Ticket Agent", minMAN: 0, minEND: 26000, minINT: 13000 }
            ]
    },
    {
        CompanyType: "Cyber Cafe",
        Positions:
            [
                { roleName: "Teacher", minMAN: 0, minEND: 15000, minINT: 30000 },
                { roleName: "Manager", minMAN: 0, minEND: 20000, minINT: 10000 },
                { roleName: "Marketer", minMAN: 0, minEND: 10000, minINT: 20000 },
                { roleName: "Administrator", minMAN: 0, minEND: 10000, minINT: 20000 },
                { roleName: "Technician", minMAN: 8750, minEND: 0, minINT: 17500 },
                { roleName: "Receptionist", minMAN: 0, minEND: 15000, minINT: 7500 },
                { roleName: "Cashier", minMAN: 0, minEND: 10000, minINT: 5000 },
                { roleName: "Cleaner", minMAN: 5000, minEND: 2500, minINT: 0 }
            ]
    },
    {
        CompanyType: "Detective Agency",
        Positions:
            [
                { roleName: "Chief Investigator", minMAN: 40000, minEND: 0, minINT: 80000 },
                { roleName: "Client Liaison", minMAN: 0, minEND: 31000, minINT: 62000 },
                { roleName: "Intelligence Analyst", minMAN: 0, minEND: 29000, minINT: 58000 },
                { roleName: "Surveillance Technician", minMAN: 26000, minEND: 0, minINT: 52000 },
                { roleName: "Private Investigator", minMAN: 22500, minEND: 0, minINT: 45000 },
                { roleName: "Trainee Investigator", minMAN: 14000, minEND: 0, minINT: 28000 },
                { roleName: "Secretary", minMAN: 12500, minEND: 25000, minINT: 0 }
            ]
    },
    {
        CompanyType: "Farm",
        Positions:
            [
                { roleName: "Consultant", minMAN: 0, minEND: 27750, minINT: 55500 },
                { roleName: "Farm Manager", minMAN: 0, minEND: 37000, minINT: 18500 },
                { roleName: "Bookkeeper", minMAN: 0, minEND: 28000, minINT: 14000 },
                { roleName: "Delivery Driver", minMAN: 23000, minEND: 11500, minINT: 0 },
                { roleName: "Dairy Farmer", minMAN: 23000, minEND: 11500, minINT: 0 },
                { roleName: "Herdsperson", minMAN: 18500, minEND: 9250, minINT: 0 },
                { roleName: "Retailer", minMAN: 0, minEND: 9250, minINT: 18500 },
                { roleName: "Poultry Farmer", minMAN: 18500, minEND: 9250, minINT: 0 },
                { roleName: "Harvester", minMAN: 14000, minEND: 7000, minINT: 0 }
            ]
    },
    {
        CompanyType: "Firework Stand",
        Positions:
            [
                { roleName: "Pyrotechnician", minMAN: 3000, minEND: 0, minINT: 1500 },
                { roleName: "Trainer", minMAN: 0, minEND: 1500, minINT: 3000 },
                { roleName: "Manager", minMAN: 0, minEND: 2000, minINT: 1000 },
                { roleName: "Advertising Manager", minMAN: 0, minEND: 1000, minINT: 2000 },
                { roleName: "Bookkeeper", minMAN: 0, minEND: 1500, minINT: 750 },
                { roleName: "Salesperson", minMAN: 0, minEND: 1000, minINT: 500 },
                { roleName: "Picker Packer", minMAN: 500, minEND: 250, minINT: 0 }
            ]
    },
    {
        CompanyType: "Fitness Center",
        Positions:
            [
                { roleName: "Manager", minMAN: 0, minEND: 62000, minINT: 31000 },
                { roleName: "Marketer", minMAN: 0, minEND: 31000, minINT: 62000 },
                { roleName: "Nutritionist", minMAN: 27250, minEND: 0, minINT: 54500 },
                { roleName: "Swimming Instructor", minMAN: 23250, minEND: 46500, minINT: 0 },
                { roleName: "HR Officer", minMAN: 0, minEND: 46500, minINT: 23250 },
                { roleName: "Fitness Instructor", minMAN: 46500, minEND: 23250, minINT: 0 },
                { roleName: "Lifeguard", minMAN: 19500, minEND: 39000, minINT: 0 },
                { roleName: "Personal Trainer", minMAN: 31000, minEND: 15500, minINT: 0 },
                { roleName: "Cleaner", minMAN: 15500, minEND: 7750, minINT: 0 },
                { roleName: "Receptionist", minMAN: 0, minEND: 10000, minINT: 5000 }
            ]
    },
    {
        CompanyType: "Flower Shop",
        Positions:
            [
                { roleName: "Manager", minMAN: 0, minEND: 2000, minINT: 1000 },
                { roleName: "Marketer", minMAN: 0, minEND: 1000, minINT: 2000 },
                { roleName: "Accountant", minMAN: 0, minEND: 1500, minINT: 750 },
                { roleName: "Florist", minMAN: 500, minEND: 1000, minINT: 0 },
                { roleName: "Arranger", minMAN: 500, minEND: 0, minINT: 1000 },
                { roleName: "Apprentice", minMAN: 250, minEND: 500, minINT: 0 },
                { roleName: "Cleaner", minMAN: 500, minEND: 250, minINT: 0 }
            ]
    },
    {
        CompanyType: "Furniture Store",
        Positions:
            [
                { roleName: "Trainer", minMAN: 0, minEND: 9750, minINT: 19500 },
                { roleName: "Manager", minMAN: 0, minEND: 13000, minINT: 6500 },
                { roleName: "Marketer", minMAN: 0, minEND: 6500, minINT: 13000 },
                { roleName: "Receptionist", minMAN: 0, minEND: 10000, minINT: 5000 },
                { roleName: "Delivery Driver", minMAN: 8000, minEND: 4000, minINT: 0 },
                { roleName: "Sales Clerk", minMAN: 0, minEND: 6500, minINT: 3250 },
                { roleName: "Cleaner", minMAN: 3500, minEND: 1750, minINT: 0 },
                { roleName: "Apprentice", minMAN: 0, minEND: 1500, minINT: 750 }
            ]
    },
    {
        CompanyType: "Game Shop",
        Positions:
            [
                { roleName: "Store Manager", minMAN: 0, minEND: 6000, minINT: 3000 },
                { roleName: "Marketer", minMAN: 0, minEND: 3000, minINT: 6000 },
                { roleName: "Game Advisor", minMAN: 0, minEND: 2250, minINT: 4500 },
                { roleName: "Accountant", minMAN: 0, minEND: 4500, minINT: 2250 },
                { roleName: "Clerk", minMAN: 1500, minEND: 3000, minINT: 0 },
                { roleName: "Cleaner", minMAN: 1500, minEND: 750, minINT: 0 }
            ]
    },
    {
        CompanyType: "Gas Station",
        Positions:
            [
                { roleName: "Trainer", minMAN: 0, minEND: 35250, minINT: 70500 },
                { roleName: "Manager", minMAN: 0, minEND: 60000, minINT: 30000 },
                { roleName: "Marketer", minMAN: 0, minEND: 20000, minINT: 40000 },
                { roleName: "Attendant", minMAN: 0, minEND: 26000, minINT: 13000 },
                { roleName: "Cleaner", minMAN: 17500, minEND: 8750, minINT: 0 }
            ]
    },
    {
        CompanyType: "Gents Strip Club",
        Positions:
            [
                { roleName: "Security Guard", minMAN: 29000, minEND: 14500, minINT: 0 },
                { roleName: "Manager", minMAN: 0, minEND: 29000, minINT: 14500 },
                { roleName: "Photographer", minMAN: 0, minEND: 14500, minINT: 29000 },
                { roleName: "Bookkeeper", minMAN: 0, minEND: 22000, minINT: 11000 },
                { roleName: "Stripper", minMAN: 7250, minEND: 14500, minINT: 0 },
                { roleName: "Cleaner", minMAN: 7500, minEND: 3750, minINT: 0 }
            ]
    },
    {
        CompanyType: "Grocery Store",
        Positions:
            [
                { roleName: "Trainer", minMAN: 0, minEND: 9000, minINT: 18000 },
                { roleName: "Manager", minMAN: 0, minEND: 12000, minINT: 6000 },
                { roleName: "Marketer", minMAN: 0, minEND: 6000, minINT: 12000 },
                { roleName: "Accountant", minMAN: 0, minEND: 9000, minINT: 4500 },
                { roleName: "Delivery Driver", minMAN: 7500, minEND: 3750, minINT: 0 },
                { roleName: "Cashier", minMAN: 3000, minEND: 6000, minINT: 0 },
                { roleName: "Stock Clerk", minMAN: 4500, minEND: 2250, minINT: 0 },
                { roleName: "Cleaner", minMAN: 3000, minEND: 1500, minINT: 0 },
                { roleName: "Cart Attendant", minMAN: 3000, minEND: 1500, minINT: 0 }
            ]
    },
    {
        CompanyType: "Gun Shop",
        Positions:
            [
                { roleName: "Instructor", minMAN: 0, minEND: 11250, minINT: 22500 },
                { roleName: "Gunsmith", minMAN: 15000, minEND: 0, minINT: 7500 },
                { roleName: "Manager", minMAN: 0, minEND: 15000, minINT: 7500 },
                { roleName: "Marketer", minMAN: 0, minEND: 7500, minINT: 15000 },
                { roleName: "Bookkeeper", minMAN: 0, minEND: 11500, minINT: 5750 },
                { roleName: "Clerk", minMAN: 3750, minEND: 7500, minINT: 0 },
                { roleName: "Cleaner", minMAN: 4000, minEND: 2000, minINT: 0 }
            ]
    },
    {
        CompanyType: "Hair Salon",
        Positions:
            [
                { roleName: "Trainer", minMAN: 0, minEND: 2250, minINT: 4500 },
                { roleName: "Aesthetician", minMAN: 0, minEND: 2250, minINT: 4500 },
                { roleName: "Senior Stylist", minMAN: 3000, minEND: 1500, minINT: 0 },
                { roleName: "Receptionist", minMAN: 0, minEND: 2500, minINT: 1250 },
                { roleName: "Colorist", minMAN: 2000, minEND: 1000, minINT: 0 },
                { roleName: "Stylist", minMAN: 1500, minEND: 750, minINT: 0 },
                { roleName: "Nail Technician", minMAN: 750, minEND: 1500, minINT: 0 },
                { roleName: "Shampooist", minMAN: 1000, minEND: 500, minINT: 0 },
                { roleName: "Apprentice", minMAN: 500, minEND: 250, minINT: 0 }
            ]
    },
    {
        CompanyType: "Ladies Strip Club",
        Positions:
            [
                { roleName: "Manager", minMAN: 0, minEND: 33000, minINT: 16500 },
                { roleName: "Photographer", minMAN: 0, minEND: 16500, minINT: 33000 },
                { roleName: "Security Guard", minMAN: 29000, minEND: 14500, minINT: 0 },
                { roleName: "Bookkeeper", minMAN: 0, minEND: 25000, minINT: 12500 },
                { roleName: "Male Stripper", minMAN: 7250, minEND: 14500, minINT: 0 },
                { roleName: "Cleaner", minMAN: 8500, minEND: 4250, minINT: 0 }
            ]
    },
    {
        CompanyType: "Law Firm",
        Positions:
            [
                { roleName: "Consultant", minMAN: 0, minEND: 16500, minINT: 33000 },
                { roleName: "Marketer", minMAN: 0, minEND: 11000, minINT: 22000 },
                { roleName: "Secretary", minMAN: 0, minEND: 16500, minINT: 8250 },
                { roleName: "Attorney", minMAN: 0, minEND: 5500, minINT: 11000 },
                { roleName: "Cleaner", minMAN: 5500, minEND: 2750, minINT: 0 },
                { roleName: "Assistant", minMAN: 0, minEND: 5500, minINT: 2750 }
            ]
    },
    {
        CompanyType: "Lingerie Store",
        Positions:
            [
                { roleName: "HR Officer", minMAN: 0, minEND: 6750, minINT: 13500 },
                { roleName: "Store Manager", minMAN: 0, minEND: 9000, minINT: 4500 },
                { roleName: "Lingerie Model", minMAN: 0, minEND: 4500, minINT: 9000 },
                { roleName: "Salesperson", minMAN: 0, minEND: 4500, minINT: 2250 },
                { roleName: "Cleaner", minMAN: 2500, minEND: 1250, minINT: 0 },
                { roleName: "Trainee", minMAN: 0, minEND: 1000, minINT: 500 }
            ]
    },
    {
        CompanyType: "Logistics Management",
        Positions:
            [
                { roleName: "Procurement Manager", minMAN: 0, minEND: 70000, minINT: 140000 },
                { roleName: "Supply Chain Manager", minMAN: 0, minEND: 62500, minINT: 125000 },
                { roleName: "Warehouse Manager", minMAN: 0, minEND: 57500, minINT: 115000 },
                { roleName: "Shift Manager", minMAN: 0, minEND: 45000, minINT: 90000 },
                { roleName: "Transport Coordinator", minMAN: 0, minEND: 42500, minINT: 85000 },
                { roleName: "Forklift Operator", minMAN: 30000, minEND: 60000, minINT: 0 },
                { roleName: "Driver", minMAN: 28750, minEND: 57500, minINT: 0 },
                { roleName: "Lumper", minMAN: 45000, minEND: 22500, minINT: 0 }
            ]
    },
    {
        CompanyType: "Meat Warehouse",
        Positions:
            [
                { roleName: "Supervisor", minMAN: 0, minEND: 18750, minINT: 37500 },
                { roleName: "Quality Controller", minMAN: 12500, minEND: 0, minINT: 25000 },
                { roleName: "Manager", minMAN: 0, minEND: 25000, minINT: 12500 },
                { roleName: "Assistant", minMAN: 0, minEND: 19000, minINT: 9500 },
                { roleName: "Butcher", minMAN: 12500, minEND: 6250, minINT: 0 },
                { roleName: "Retailer", minMAN: 0, minEND: 6250, minINT: 12500 },
                { roleName: "Packer", minMAN: 9500, minEND: 4750, minINT: 0 },
                { roleName: "Cleaner", minMAN: 6500, minEND: 3250, minINT: 0 },
                { roleName: "Apprentice Butcher", minMAN: 3000, minEND: 1500, minINT: 0 }
            ]
    },
    {
        CompanyType: "Mechanic Shop",
        Positions:
            [
                { roleName: "Trainer", minMAN: 0, minEND: 12750, minINT: 25500 },
                { roleName: "Manager", minMAN: 0, minEND: 17000, minINT: 8500 },
                { roleName: "Receptionist", minMAN: 0, minEND: 13000, minINT: 6500 },
                { roleName: "Technician", minMAN: 8500, minEND: 4250, minINT: 0 },
                { roleName: "Cleaner", minMAN: 4500, minEND: 2250, minINT: 0 },
                { roleName: "Apprentice Technician", minMAN: 2000, minEND: 1000, minINT: 0 }
            ]
    },
    {
        CompanyType: "Mining Corporation",
        Positions:
            [
                { roleName: "Site Manager", minMAN: 0, minEND: 48750, minINT: 97500 },
                { roleName: "Safety Inspector", minMAN: 47500, minEND: 0, minINT: 95000 },
                { roleName: "Sales Executive", minMAN: 0, minEND: 41500, minINT: 83000 },
                { roleName: "Mine Engineer", minMAN: 0, minEND: 40500, minINT: 81000 },
                { roleName: "Production Foreman", minMAN: 39500, minEND: 79000, minINT: 0 },
                { roleName: "Electrician", minMAN: 39000, minEND: 78000, minINT: 0 },
                { roleName: "Secretary", minMAN: 0, minEND: 78000, minINT: 39000 },
                { roleName: "Mill Operator", minMAN: 75000, minEND: 37500, minINT: 0 }
            ]
    },
    {
        CompanyType: "Music Store",
        Positions:
            [
                { roleName: "Trainer", minMAN: 0, minEND: 5250, minINT: 10500 },
                { roleName: "Musician", minMAN: 4500, minEND: 0, minINT: 9000 },
                { roleName: "Supervisor", minMAN: 0, minEND: 7000, minINT: 3500 },
                { roleName: "Bookkeeper", minMAN: 0, minEND: 5500, minINT: 2750 },
                { roleName: "Sales Assistant", minMAN: 0, minEND: 3500, minINT: 1750 },
                { roleName: "Cleaner", minMAN: 2000, minEND: 1000, minINT: 0 },
                { roleName: "Sales Apprentice", minMAN: 0, minEND: 1000, minINT: 500 }
            ]
    },
    {
        CompanyType: "Nightclub",
        Positions:
            [
                { roleName: "Trainer", minMAN: 0, minEND: 40500, minINT: 81000 },
                { roleName: "Manager", minMAN: 0, minEND: 54000, minINT: 27000 },
                { roleName: "Promoter", minMAN: 0, minEND: 27000, minINT: 54000 },
                { roleName: "Bouncer", minMAN: 48000, minEND: 24000, minINT: 0 },
                { roleName: "Personal Assistant", minMAN: 0, minEND: 40500, minINT: 20250 },
                { roleName: "Disk-jockey", minMAN: 0, minEND: 20250, minINT: 40500 },
                { roleName: "Bartender", minMAN: 13500, minEND: 27000, minINT: 0 },
                { roleName: "Barback", minMAN: 10250, minEND: 20500, minINT: 0 },
                { roleName: "Cleaner", minMAN: 13500, minEND: 6750, minINT: 0 }
            ]
    },
    {
        CompanyType: "Oil Rig",
        Positions:
            [
                { roleName: "Inspector", minMAN: 0, minEND: 112500, minINT: 225000 },
                { roleName: "Driller", minMAN: 150000, minEND: 0, minINT: 75000 },
                { roleName: "Sales Executive", minMAN: 0, minEND: 65750, minINT: 131500 },
                { roleName: "Secretary", minMAN: 0, minEND: 112500, minINT: 56250 },
                { roleName: "Motor Hand", minMAN: 112500, minEND: 0, minINT: 56250 },
                { roleName: "Derrick Hand", minMAN: 94000, minEND: 47000, minINT: 0 },
                { roleName: "Roughneck", minMAN: 75000, minEND: 37500, minINT: 0 }
            ]
    },
    {
        CompanyType: "Private Security Firm",
        Positions:
            [
                { roleName: "Chief Strategist", minMAN: 0, minEND: 82500, minINT: 165000 },
                { roleName: "Defense Consultant", minMAN: 0, minEND: 67500, minINT: 135000 },
                { roleName: "Company Liaison", minMAN: 0, minEND: 115000, minINT: 57500 },
                { roleName: "Team Leader", minMAN: 110000, minEND: 55000, minINT: 0 },
                { roleName: "Medic", minMAN: 0, minEND: 45000, minINT: 90000 },
                { roleName: "Disposal Engineer", minMAN: 0, minEND: 42500, minINT: 85000 },
                { roleName: "Comms Engineer", minMAN: 0, minEND: 42500, minINT: 85000 },
                { roleName: "Spokesperson", minMAN: 0, minEND: 40000, minINT: 80000 },
                { roleName: "Reconnaissance", minMAN: 80000, minEND: 0, minINT: 40000 },
                { roleName: "Armorer", minMAN: 40000, minEND: 80000, minINT: 0 },
                { roleName: "Security Contractor", minMAN: 70000, minEND: 35000, minINT: 0 }
            ]
    },
    {
        CompanyType: "Property Broker",
        Positions:
            [
                { roleName: "Broker Support", minMAN: 0, minEND: 2250, minINT: 4500 },
                { roleName: "Valuation Specialist", minMAN: 0, minEND: 1500, minINT: 3000 },
                { roleName: "Team Manager", minMAN: 0, minEND: 3000, minINT: 1500 },
                { roleName: "Graphic Designer", minMAN: 0, minEND: 1500, minINT: 3000 },
                { roleName: "Receptionist", minMAN: 0, minEND: 2500, minINT: 1250 },
                { roleName: "Property Broker", minMAN: 0, minEND: 1500, minINT: 750 },
                { roleName: "Cleaner", minMAN: 1000, minEND: 500, minINT: 0 },
                { roleName: "Associate Broker", minMAN: 0, minEND: 500, minINT: 250 }
            ]
    },
    {
        CompanyType: "Pub",
        Positions:
            [
                { roleName: "Trainer", minMAN: 0, minEND: 4500, minINT: 9000 },
                { roleName: "Bouncer", minMAN: 6000, minEND: 3000, minINT: 0 },
                { roleName: "Manager", minMAN: 0, minEND: 6000, minINT: 3000 },
                { roleName: "Promoter", minMAN: 0, minEND: 3000, minINT: 6000 },
                { roleName: "Bookkeeper", minMAN: 0, minEND: 4500, minINT: 2250 },
                { roleName: "Bartender", minMAN: 1500, minEND: 3000, minINT: 0 },
                { roleName: "Waiter", minMAN: 1500, minEND: 3000, minINT: 0 },
                { roleName: "Cleaner", minMAN: 1500, minEND: 750, minINT: 0 }
            ]
    },
    {
        CompanyType: "Restaurant",
        Positions:
            [
                { roleName: "Head Chef", minMAN: 0, minEND: 5000, minINT: 2500 },
                { roleName: "Sous Chef", minMAN: 0, minEND: 2000, minINT: 4000 },
                { roleName: "Head Waiter", minMAN: 0, minEND: 4000, minINT: 2000 },
                { roleName: "Chef", minMAN: 1500, minEND: 0, minINT: 3000 },
                { roleName: "Waiter", minMAN: 1250, minEND: 2500, minINT: 0 },
                { roleName: "Line Cook", minMAN: 1250, minEND: 0, minINT: 2500 },
                { roleName: "Kitchen Assistant", minMAN: 1500, minEND: 750, minINT: 0 },
                { roleName: "Apprentice Chef", minMAN: 750, minEND: 0, minINT: 1500 },
                { roleName: "Dishwasher", minMAN: 1500, minEND: 750, minINT: 0 }
            ]
    },
    {
        CompanyType: "Software Corporation",
        Positions:
            [
                { roleName: "Consultant", minMAN: 0, minEND: 36000, minINT: 72000 },
                { roleName: "Lead Developer", minMAN: 0, minEND: 48000, minINT: 24000 },
                { roleName: "Marketer", minMAN: 0, minEND: 24000, minINT: 48000 },
                { roleName: "Analyst", minMAN: 0, minEND: 36000, minINT: 18000 },
                { roleName: "Developer", minMAN: 0, minEND: 12000, minINT: 24000 },
                { roleName: "Graphic Designer", minMAN: 0, minEND: 9000, minINT: 18000 },
                { roleName: "Tester", minMAN: 0, minEND: 6000, minINT: 12000 },
                { roleName: "Cleaner", minMAN: 12000, minEND: 6000, minINT: 0 },
                { roleName: "Apprentice", minMAN: 0, minEND: 3000, minINT: 6000 }
            ]
    },
    {
        CompanyType: "Sweet Shop",
        Positions:
            [
                { roleName: "Manager", minMAN: 0, minEND: 4000, minINT: 2000 },
                { roleName: "Marketer", minMAN: 0, minEND: 2000, minINT: 4000 },
                { roleName: "Bookkeeper", minMAN: 0, minEND: 3000, minINT: 1500 },
                { roleName: "Confectionist", minMAN: 0, minEND: 1250, minINT: 2500 },
                { roleName: "Clerk", minMAN: 1000, minEND: 2000, minINT: 0 },
                { roleName: "Packager", minMAN: 750, minEND: 1500, minINT: 0 },
                { roleName: "Cleaner", minMAN: 1000, minEND: 500, minINT: 0 }
            ]
    },
    {
        CompanyType: "Television Network",
        Positions:
            [
                { roleName: "Attorney", minMAN: 0, minEND: 66000, minINT: 132000 },
                { roleName: "Marketer", minMAN: 0, minEND: 66000, minINT: 132000 },
                { roleName: "Anchor", minMAN: 0, minEND: 66000, minINT: 132000 },
                { roleName: "Writer", minMAN: 0, minEND: 57750, minINT: 115500 },
                { roleName: "Producer", minMAN: 0, minEND: 49500, minINT: 99000 },
                { roleName: "Secretary", minMAN: 0, minEND: 99000, minINT: 49500 },
                { roleName: "Reporter", minMAN: 0, minEND: 41250, minINT: 82500 },
                { roleName: "Programmer", minMAN: 0, minEND: 33000, minINT: 66000 },
                { roleName: "Camera Operator", minMAN: 24750, minEND: 0, minINT: 49500 },
                { roleName: "Sales Executive", minMAN: 0, minEND: 49500, minINT: 24750 },
                { roleName: "Cleaner", minMAN: 33000, minEND: 16500, minINT: 0 },
                { roleName: "Stagehand", minMAN: 33000, minEND: 16500, minINT: 0 }
            ]
    },
    {
        CompanyType: "Theater",
        Positions:
            [
                { roleName: "Manager", minMAN: 0, minEND: 80000, minINT: 40000 },
                { roleName: "Marketing Manager", minMAN: 0, minEND: 40000, minINT: 80000 },
                { roleName: "Technician", minMAN: 60000, minEND: 0, minINT: 30000 },
                { roleName: "Accountant", minMAN: 0, minEND: 60000, minINT: 30000 },
                { roleName: "Programmer", minMAN: 0, minEND: 25000, minINT: 50000 },
                { roleName: "Ticketing Agent", minMAN: 0, minEND: 20000, minINT: 10000 },
                { roleName: "Janitor", minMAN: 20000, minEND: 10000, minINT: 0 },
                { roleName: "Usher", minMAN: 10000, minEND: 20000, minINT: 0 }
            ]
    },
    {
        CompanyType: "Toy Store",
        Positions:
            [
                { roleName: "Training Advisor", minMAN: 0, minEND: 7500, minINT: 15000 },
                { roleName: "Store Manager", minMAN: 0, minEND: 10000, minINT: 5000 },
                { roleName: "Marketing Executive", minMAN: 0, minEND: 5000, minINT: 10000 },
                { roleName: "Office Clerk", minMAN: 0, minEND: 7500, minINT: 3750 },
                { roleName: "Sales Assistant", minMAN: 2500, minEND: 5000, minINT: 0 },
                { roleName: "Stock Clerk", minMAN: 4000, minEND: 2000, minINT: 0 },
                { roleName: "Cleaner", minMAN: 2500, minEND: 1250, minINT: 0 }
            ]
    },
    {
        CompanyType: "Zoo",
        Positions:
            [
                { roleName: "Consultant", minMAN: 0, minEND: 87000, minINT: 174000 },
                { roleName: "Manager", minMAN: 0, minEND: 116000, minINT: 58000 },
                { roleName: "Photographer", minMAN: 0, minEND: 58000, minINT: 116000 },
                { roleName: "Veterinarian", minMAN: 58000, minEND: 0, minINT: 116000 },
                { roleName: "Bookkeeper", minMAN: 0, minEND: 87000, minINT: 43500 },
                { roleName: "Animal Trainer", minMAN: 36250, minEND: 0, minINT: 72500 },
                { roleName: "Zoo Keeper", minMAN: 58000, minEND: 29000, minINT: 0 },
                { roleName: "Aquarist", minMAN: 0, minEND: 58000, minINT: 29000 },
                { roleName: "Cashier", minMAN: 0, minEND: 29000, minINT: 14500 },
                { roleName: "Intern", minMAN: 14500, minEND: 7250, minINT: 0 }
            ]
    }
];