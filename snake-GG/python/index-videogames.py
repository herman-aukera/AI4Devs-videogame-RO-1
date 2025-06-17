# NO TOCAR ESTE ARCHIVO
import os

def create_index_html(base_path):
    # El archivo HTML donde se escribirán los enlaces
    index_file_path = os.path.join(base_path, 'index.html')

    # Comenzar a escribir en el archivo
    with open(index_file_path, 'w', encoding='utf-8') as file:
        file.write('<!DOCTYPE html>\n')
        file.write('<html lang="es">\n')
        file.write('<head>\n')
        file.write('    <meta charset="UTF-8">\n')
        file.write('    <title>Índice de Juegos - AI4Devs</title>\n')
        file.write('    <link rel="stylesheet" href="styles.css">\n')
        file.write('</head>\n')
        file.write('<body>\n')
        file.write('    <div id="game-index">\n')
        file.write('        <h1>Selecciona tu juego</h1>\n')
        file.write('        <ul>\n')

        # Obtener y filtrar solo las carpetas de juegos (que contienen un guión y no empiezan con punto)
        all_items = os.listdir(base_path)
        directories = [item for item in all_items if os.path.isdir(os.path.join(base_path, item))]
        # Filtrar solo carpetas que contengan guión y NO empiecen con punto
        game_directories = sorted([item for item in directories if '-' in item and not item.startswith('.')])

        # Listar todas las carpetas de juegos y crear un enlace para cada juego
        for item in game_directories:
            # Extrae el nombre del juego separándolo de las iniciales del nombre
            game_name = item.split('-')[0]
            author_initials = item.split('-')[1] if len(item.split('-')) > 1 else ''
            display_name = f"{game_name} ({author_initials})" if author_initials else game_name
            file.write(f'            <li><a href="{item}/index.html">{display_name}</a></li>\n')

        file.write('        </ul>\n')
        file.write('    </div>\n')
        file.write('    <footer>\n')
        file.write('        <p>© AI4Devs students</p>\n')
        file.write('    </footer>\n')
        file.write('</body>\n')
        file.write('</html>\n')

# Especifica el directorio base donde se encuentran las carpetas de los juegos
base_path = './'
create_index_html(base_path)
