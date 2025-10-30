import pygame
import time
pygame.mixer.init()

# NOTE: You MUST ensure this file path is correct on your computer
music_file = r"C:\Users\DELL\Downloads\music.mp3"


try :
    pygame.mixer.music.load(music_file)
except pygame.error as e:
    print(f"Error will come:{e}")
    print("PLease check your file")
    exit()

paused = False
print("\n---------Simple pygamemusic player----------")
print(f"Loaded:{music_file}")
print("Commands: p(play/pause) | r(resume) | s(stop) | q(quit)")
print("-------------------------------------------------")

pygame.mixer.music.play()
print("Playback started...")

while True:
    command = input("Enter command :").strip().upper()

    if command == 'P':
        if pygame.mixer.music.get_busy() and not paused:
            # 1. Pause currently playing music
            pygame.mixer.music.pause()
            paused = True
            print("Music paused")
        elif paused:
            # Already paused, do nothing, or print status
            print("Music is already paused. Use 'R' to resume.")
        elif not pygame.mixer.music.get_busy() and not paused:
            # 2. Restart music if it is stopped (either by 'S' or finished)
            pygame.mixer.music.play()
            print("Music started from the beginning.")
        else:
            print("Music is not currently playing")

    elif command == 'R':
        if paused :
            # Resume functionality
            pygame.mixer.music.unpause()
            paused = False
            print("Music resume")
        else:
            print("Music is not paused ")

    elif command == 'S':
        # Stop functionality
        if pygame.mixer.music.get_busy() or paused:
            pygame.mixer.music.stop()
            paused = False
            print("Music Stopped. Press P to play from the beginning")
        else:
            print("Music is already stopped.")

    elif command == 'Q':
        pygame.mixer.music.stop()
        print("Exiting player")
        break
        
    # Check if the song naturally finished playing (and keep the loop running)
    elif not pygame.mixer.music.get_busy() and not paused:
        print("Song finished playing. Press P to play again or Q to quit.")
        # Do NOT break here, keep the loop running so user can enter P or Q.
        
    else:
        print("Invalid command")