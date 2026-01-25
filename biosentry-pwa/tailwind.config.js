/** @type {import('tailwindcss').Config} */
export default {
    content: ['./src/**/*.{html,js,svelte,ts}'],
    theme: {
        extend: {
            colors: {
                primary: 'var(--primary)',
                secondary: 'var(--secondary)',
                accent: 'var(--accent)',
                surface: 'var(--surface)',
                'text-muted': 'var(--text-muted)',
                border: 'var(--border)',
            }
        },
    },
    plugins: [],
}
