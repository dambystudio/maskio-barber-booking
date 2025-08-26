import { neon } from '@neondatabase/serverless';

const DATABASE_URL = process.env.DATABASE_URL || 'postgres://neondb_owner:npg_Wj09qDUmTsxE@ep-old-forest-a2ur722g-pooler.eu-central-1.aws.neon.tech/neondb?sslmode=require';
const sql = neon(DATABASE_URL);

async function checkTableStructure() {
    console.log('🔍 Checking bookings table structure...');
    
    try {
        const columns = await sql`
            SELECT column_name, data_type 
            FROM information_schema.columns 
            WHERE table_name = 'bookings' 
            ORDER BY ordinal_position
        `;
        
        console.log('📋 Bookings table columns:');
        columns.forEach(col => {
            console.log(`  - ${col.column_name}: ${col.data_type}`);
        });
        
        return columns;
    } catch (error) {
        console.error('❌ Error checking table structure:', error);
        return [];
    }
}

async function searchCustomerBookings(searchTerm) {
    console.log(`🔍 Searching for customer bookings with: "${searchTerm}"\n`);
    
    try {
        // First check table structure
        const columns = await checkTableStructure();
        const columnNames = columns.map(col => col.column_name);
        
        // Try to find bookings using different possible column combinations
        let bookings = [];
        
        try {
            // Try with customer_email, customer_phone, customer_name
            bookings = await sql`
                SELECT 
                    id,
                    customer_name,
                    customer_email,
                    customer_phone,
                    service,
                    barber_name,
                    date,
                    time,
                    status,
                    price,
                    created_at
                FROM bookings 
                WHERE 
                    LOWER(customer_email) LIKE LOWER(${'%' + searchTerm + '%'}) OR
                    customer_phone LIKE ${'%' + searchTerm + '%'} OR
                    LOWER(customer_name) LIKE LOWER(${'%' + searchTerm + '%'})
                ORDER BY created_at DESC
            `;
        } catch (e1) {
            console.log('First attempt failed, trying alternative column names...');
            
            try {
                // Try with email, phone, customerName  
                bookings = await sql`
                    SELECT 
                        id,
                        "customerName" as customer_name,
                        "customerEmail" as customer_email,
                        "customerPhone" as customer_phone,
                        service,
                        "barberName" as barber_name,
                        date,
                        time,
                        status,
                        price,
                        "createdAt" as created_at
                    FROM bookings 
                    WHERE 
                        LOWER("customerEmail") LIKE LOWER(${'%' + searchTerm + '%'}) OR
                        "customerPhone" LIKE ${'%' + searchTerm + '%'} OR
                        LOWER("customerName") LIKE LOWER(${'%' + searchTerm + '%'})
                    ORDER BY "createdAt" DESC
                `;
            } catch (e2) {
                console.log('Second attempt failed, getting all records...');
                
                // Just get all records to see what we have
                bookings = await sql`SELECT * FROM bookings LIMIT 5`;
                console.log('Sample booking record:', bookings[0]);
                return;
            }
        }
        
        if (bookings.length === 0) {
            console.log('\n❌ No bookings found for this search term.');
            
            // Show sample of all bookings to help with debugging
            const sampleBookings = await sql`SELECT * FROM bookings LIMIT 3`;
            if (sampleBookings.length > 0) {
                console.log('\n📋 Sample bookings in database:');
                sampleBookings.forEach((booking, index) => {
                    console.log(`${index + 1}. ${JSON.stringify(booking, null, 2)}`);
                });
            }
            return;
        }
        
        console.log(`\n✅ Found ${bookings.length} booking(s):\n`);
        
        // Group by customer
        const customerGroups = {};
        
        bookings.forEach(booking => {
            const email = booking.customer_email || 'No email';
            const phone = booking.customer_phone || 'No phone';
            const name = booking.customer_name || 'No name';
            
            const customerKey = `${name} (${email}) - ${phone}`;
            
            if (!customerGroups[customerKey]) {
                customerGroups[customerKey] = [];
            }
            customerGroups[customerKey].push(booking);
        });
        
        // Display results grouped by customer
        Object.entries(customerGroups).forEach(([customerInfo, customerBookings]) => {
            console.log(`👤 ${customerInfo}`);
            console.log(`   📊 Total bookings: ${customerBookings.length}`);
            
            customerBookings.forEach((booking, index) => {
                const status = booking.status || 'unknown';
                const statusIcon = status === 'confirmed' ? '✅' : status === 'pending' ? '⏳' : status === 'cancelled' ? '❌' : '❓';
                
                console.log(`   ${index + 1}. ${statusIcon} ${booking.service} with ${booking.barber_name}`);
                console.log(`      📅 ${booking.date} at ${booking.time}`);
                console.log(`      💰 €${booking.price || 'N/A'}`);
                console.log(`      🆔 ID: ${booking.id}`);
                console.log(`      📝 Created: ${new Date(booking.created_at).toLocaleString('it-IT')}`);
                console.log('');
            });
            
            // Customer statistics
            const confirmedBookings = customerBookings.filter(b => b.status === 'confirmed').length;
            const cancelledBookings = customerBookings.filter(b => b.status === 'cancelled').length;
            const totalSpent = customerBookings
                .filter(b => b.status === 'confirmed' && b.price)
                .reduce((sum, b) => sum + parseFloat(b.price), 0);
            
            console.log(`   📈 Statistics:`);
            console.log(`      ✅ Confirmed: ${confirmedBookings}`);
            console.log(`      ❌ Cancelled: ${cancelledBookings}`);
            console.log(`      💰 Total spent: €${totalSpent.toFixed(2)}`);
            console.log(`   ${'='.repeat(50)}\n`);
        });
        
    } catch (error) {
        console.error('❌ Error searching customer bookings:', error);
    }
}

// Get search term from command line or use default
const searchTerm = process.argv[2];

if (!searchTerm) {
    console.log('❌ Please provide a search term (email, phone, or name)');
    console.log('Usage: node search-customer-bookings.mjs <search_term>');
    console.log('Example: node search-customer-bookings.mjs mario@test.com');
    console.log('Example: node search-customer-bookings.mjs +393331234567');
    console.log('Example: node search-customer-bookings.mjs "Mario Rossi"');
    process.exit(1);
}

searchCustomerBookings(searchTerm);
