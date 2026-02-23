import { mutation } from './_generated/server'

/**
 * Seed the database with test data.
 * Run from the Convex dashboard or via:
 *   npx convex run seed:seedDatabase
 */
export const seedDatabase = mutation({
    args: {},
    handler: async (ctx) => {
        // Check if data already exists
        // const existingProducts = await ctx.db.query('products').first()
        // if (existingProducts) {
        //     return { message: 'Database already seeded' }
        // }

        // --- Users ---
        const studentUserId = await ctx.db.insert('users', {
            email: 'fvicencio@gmail.com',
            role: 'student',
        })

        const parentUserId = await ctx.db.insert('users', {
            email: 'fvp@live.cl',
            role: 'parent',
        })

        const vendorUserId = await ctx.db.insert('users', {
            email: 'fvicencio@me.com',
            role: 'vendor',
        })

        // --- Student ---
        const studentId = await ctx.db.insert('students', {
            userId: studentUserId,
            fullName: 'Mateo González',
            rut: '12.345.678-9',
            grade: '5° Básico',
            avatarInitials: 'MG',
            generalBalance: 15000,
            healthyBalance: 8000,
            qrCode: 'KIOSK-12345678-9',
            biometricId: 'MOCK-BIO-001',
        })

        // --- Parent ---
        const parentId = await ctx.db.insert('parents', {
            userId: parentUserId,
            fullName: 'Carolina González',
        })

        // Link parent to student
        await ctx.db.insert('parentStudents', {
            parentId,
            studentId,
        })

        // --- Vendor ---
        await ctx.db.insert('vendors', {
            userId: vendorUserId,
            businessName: 'Kiosko Don Pedro',
            vendorCode: 'VP001',
            isOnline: true,
        })

        // --- Savings Goal ---
        await ctx.db.insert('savingsGoals', {
            studentId,
            name: 'Bicicleta Nueva',
            targetAmount: 50000,
            currentAmount: 12000,
            icon: '🚲',
            active: true,
        })

        // --- Consumption Limit ---
        await ctx.db.insert('consumptionLimits', {
            studentId,
            enabled: true,
            unhealthyPercent: 30,
            setBy: parentId,
        })

        // --- Products (with barcodes) ---
        const products = [
            // Frutas (sin barcode — se selecciona del menú)
            { name: 'Manzana', price: 500, category: 'Frutas', icon: '🍎', isHealthy: true, active: true },
            { name: 'Plátano', price: 400, category: 'Frutas', icon: '🍌', isHealthy: true, active: true },
            { name: 'Naranja', price: 500, category: 'Frutas', icon: '🍊', isHealthy: true, active: true },
            { name: 'Uvas', price: 600, category: 'Frutas', icon: '🍇', isHealthy: true, active: true },
            { name: 'Pera', price: 500, category: 'Frutas', icon: '🍐', isHealthy: true, active: true },
            { name: 'Frutilla', price: 700, category: 'Frutas', icon: '🍓', isHealthy: true, active: true },
            { name: 'Mandarina', price: 400, category: 'Frutas', icon: '🍊', isHealthy: true, active: true },
            { name: 'Kiwi', price: 500, category: 'Frutas', icon: '🥝', isHealthy: true, active: true },

            // Bebidas saludables (con barcode)
            { name: 'Jugo Natural', price: 800, category: 'Bebidas', icon: '🧃', isHealthy: true, active: true, barcode: '7801234000101' },
            { name: 'Agua Mineral', price: 600, category: 'Bebidas', icon: '💧', isHealthy: true, active: true, barcode: '7801234000102' },

            // Snacks saludables (con barcode)
            { name: 'Barra de Cereal', price: 700, category: 'Snacks', icon: '🥣', isHealthy: true, active: true, barcode: '7801234000201' },
            { name: 'Sándwich Integral', price: 1200, category: 'Comidas', icon: '🥪', isHealthy: true, active: true, barcode: '7801234000301' },
            { name: 'Yogur Natural', price: 600, category: 'Lácteos', icon: '🥛', isHealthy: true, active: true, barcode: '7801234000401' },

            // No saludables (con barcode)
            { name: 'Galletas', price: 500, category: 'Snacks', icon: '🍪', isHealthy: false, active: true, barcode: '7801234000501' },
            { name: 'Papas Fritas', price: 800, category: 'Snacks', icon: '🍟', isHealthy: false, active: true, barcode: '7801234000502' },
            { name: 'Bebida Azucarada', price: 700, category: 'Bebidas', icon: '🥤', isHealthy: false, active: true, barcode: '7801234000503' },
            { name: 'Chocolate', price: 600, category: 'Dulces', icon: '🍫', isHealthy: false, active: true, barcode: '7801234000601' },
            { name: 'Gomitas', price: 400, category: 'Dulces', icon: '🍬', isHealthy: false, active: true, barcode: '7801234000602' },
            { name: 'Helado', price: 1000, category: 'Dulces', icon: '🍦', isHealthy: false, active: true, barcode: '7801234000603' },

            // Librería (con barcode)
            { name: 'Cuaderno 100 hojas', price: 2500, category: 'Librería', icon: '📓', isHealthy: true, active: true, barcode: '7801234001001', subcategory: 'Librería' },
            { name: 'Lápiz grafito', price: 300, category: 'Librería', icon: '✏️', isHealthy: true, active: true, barcode: '7801234001002', subcategory: 'Librería' },
            { name: 'Goma de borrar', price: 200, category: 'Librería', icon: '🧹', isHealthy: true, active: true, barcode: '7801234001003', subcategory: 'Librería' },
            { name: 'Lápices de colores', price: 3500, category: 'Librería', icon: '🖍️', isHealthy: true, active: true, barcode: '7801234001004', subcategory: 'Librería' },
            { name: 'Regla 30cm', price: 800, category: 'Librería', icon: '📏', isHealthy: true, active: true, barcode: '7801234001005', subcategory: 'Librería' },
            { name: 'Pegamento', price: 1200, category: 'Librería', icon: '🧴', isHealthy: true, active: true, barcode: '7801234001006', subcategory: 'Librería' },
            { name: 'Tijeras escolares', price: 1500, category: 'Librería', icon: '✂️', isHealthy: true, active: true, barcode: '7801234001007', subcategory: 'Librería' },
        ]

        for (const p of products) {
            await ctx.db.insert('products', p)
        }

        // --- Sample Transactions ---
        const transactions = [
            { studentId, type: 'recarga' as const, amount: 10000, description: 'Recarga de papá', isHealthy: true, balanceAfter: 15000 },
            { studentId, type: 'compra' as const, amount: -500, description: 'Manzana', isHealthy: true, balanceAfter: 14500, category: 'Frutas', icon: '🍎' },
            { studentId, type: 'compra' as const, amount: -800, description: 'Papas Fritas', isHealthy: false, balanceAfter: 13700, category: 'Snacks', icon: '🍟' },
            { studentId, type: 'ahorro' as const, amount: -2000, description: 'Ahorro para Bicicleta Nueva', isHealthy: true, balanceAfter: 11700, category: 'Ahorro', icon: 'savings' },
            { studentId, type: 'recarga' as const, amount: 5000, description: 'Recarga semanal', isHealthy: true, balanceAfter: 16700, icon: 'account_balance_wallet' },
            { studentId, type: 'compra' as const, amount: -1200, description: 'Sándwich Integral', isHealthy: true, balanceAfter: 15500, category: 'Comidas', icon: '🥪' },
            { studentId, type: 'compra' as const, amount: -500, description: 'Galletas', isHealthy: false, balanceAfter: 15000, category: 'Snacks', icon: '🍪' },
            { studentId, type: 'compra' as const, amount: -2500, description: 'Cuaderno 100 hojas', isHealthy: true, balanceAfter: 12500, category: 'Librería', icon: '📓' },
            { studentId, type: 'compra' as const, amount: -300, description: 'Lápiz grafito', isHealthy: true, balanceAfter: 12200, category: 'Librería', icon: '✏️' },
        ]

        for (const t of transactions) {
            await ctx.db.insert('transactions', t)
        }

        // --- Sample Deposit ---
        // (parentId is set from above)
        await ctx.db.insert('deposits', {
            parentId,
            studentId,
            amount: 10000,
            method: 'transfer',
            reference: 'TRF-20260222-001',
            status: 'confirmed',
        })

        return {
            message: 'Database seeded successfully!',
            data: {
                studentEmail: 'fvicencio@gmail.com',
                parentEmail: 'fvp@live.cl',
                vendorEmail: 'fvicencio@me.com',
                products: products.length,
                transactions: transactions.length,
            },
        }
    },
})
