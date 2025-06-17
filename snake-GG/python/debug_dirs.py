import os

print("=== DEBUG DIRECTORIOS ===")
all_items = os.listdir('./')
print('Todos los items:', all_items)

directories = [item for item in all_items if os.path.isdir(item)]
print('Solo directorios:', directories) 

game_directories = [item for item in directories if '-' in item and not item.startswith('.')]
print('Directorios de juegos filtrados:', game_directories)

# Verificar cada directorio individualmente
for item in directories:
    has_dash = '-' in item
    starts_with_dot = item.startswith('.')
    print(f"'{item}': tiene guión={has_dash}, empieza con punto={starts_with_dot}")
