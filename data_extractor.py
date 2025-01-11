

import tkinter as tk
from tkinter import filedialog, messagebox
from tkinter import ttk
from PIL import Image, ImageTk
from selenium import webdriver
from selenium.webdriver.chrome.service import Service
import csv

class ImageListApp:
    def __init__(self, root,driver,urllist,csv_file):
        self.root = root
        self.root.title("Image List Application")
        self.root.geometry("500x500")
        self.driver=driver
        self.urlclusters={}
        self.urllist=urllist
        self.currenturl=self.urllist[0]
        self.currenturli=0
        self.driver.get(self.currenturl)
        self.csv_file=csv_file

        # List to hold items (text + image paths)
        self.items = []

        # Frame for the list of items
        self.list_frame = tk.Frame(self.root)
        self.list_frame.pack(fill=tk.BOTH, expand=True)

        # Scrollable canvas for the items
        self.canvas = tk.Canvas(self.list_frame)
        self.scrollbar = tk.Scrollbar(self.list_frame, orient="vertical", command=self.canvas.yview)
        self.scrollable_frame = tk.Frame(self.canvas)

        self.scrollable_frame.bind(
            "<Configure>",
            lambda e: self.canvas.configure(scrollregion=self.canvas.bbox("all"))
        )

        self.canvas.create_window((0, 0), window=self.scrollable_frame, anchor="nw")
        self.canvas.configure(yscrollcommand=self.scrollbar.set)

        self.canvas.pack(side="left", fill=tk.BOTH, expand=True)
        self.scrollbar.pack(side="right", fill="y")

        # Frame for adding new items
        self.add_item_frame = tk.Frame(self.root)
        self.add_item_frame.pack(fill=tk.X)

        tk.Label(self.add_item_frame, text="New Item:").pack(side=tk.LEFT, padx=5)
        self.entry = tk.Entry(self.add_item_frame)
        self.entry.pack(side=tk.LEFT, fill=tk.X, expand=True, padx=5)

        self.add_image_button = tk.Button(self.add_item_frame, text="Assign", command=self.assign)
        self.add_image_button.pack(side=tk.LEFT, padx=5)

        self.add_item_button = tk.Button(self.add_item_frame, text="Add Item", command=self.add_item)
        self.add_item_button.pack(side=tk.LEFT, padx=5)

        # Attribute to store the selected image path
        self.image_path = None

    def assign(self):
        item_text = self.entry.get().strip()
        
        if not item_text:
            messagebox.showwarning("Input Error", "Please enter a name for the item.")
            return
        
        if item_text not in self.urlclusters.keys() :
            messagebox.showwarning("Input Error", "No such a cluster.")
            return
        self.urlclusters[item_text].append(self.currenturl)
        self.currenturli+=1
        if self.currenturli>=len(self.urllist):
            print("All urls are clustered.")
            self.finish()
        else:
            self.currenturl=self.urllist[self.currenturli]
            self.driver.get(self.currenturl)
        
        self.entry.delete(0, tk.END)
        self.image_path = None

    def add_item(self):
        item_text = self.entry.get().strip()
        if not item_text:
            messagebox.showwarning("Input Error", "Please enter a name for the item.")
            return

        self.image_path="temp/"+str(self.urllist.index(self.currenturl))+".png"
        self.driver.save_screenshot(self.image_path)
        # Validate the image path and load the image
        try:
            img = Image.open(self.image_path)
        except Exception as e:
            messagebox.showerror("Image Error", f"Failed to load image: {e}")
            self.image_path = None
            return
        if item_text in self.urlclusters.keys():
            self.urlclusters[item_text].append(self.currenturl)
        else:
            self.urlclusters[item_text]=[self.currenturl]
        # Add the item to the list and update the UI
        self.items.append((item_text, self.image_path))
        self.display_items()
        self.currenturli+=1
        if self.currenturli>=len(self.urllist):
            print("All urls are clustered.")
            self.finish()
        else:
            self.currenturl=self.urllist[self.currenturli]
            self.driver.get(self.currenturl)
        # Reset the input fields
        self.entry.delete(0, tk.END)
        self.image_path = None

    def display_items(self):
        # Clear the current items
        for widget in self.scrollable_frame.winfo_children():
            widget.destroy()

        # Display each item
        for idx, (text, img_path) in enumerate(self.items):
            item_frame = tk.Frame(self.scrollable_frame, pady=5)
            item_frame.pack(fill=tk.X, padx=10)

            # Load and display the image
            try:
                img = Image.open(img_path).resize((384, 256), Image.Resampling.LANCZOS)
                img_tk = ImageTk.PhotoImage(img)
                img_label = tk.Label(item_frame, image=img_tk)
                img_label.image = img_tk  # Keep a reference to avoid garbage collection
                img_label.pack(side=tk.LEFT, padx=5)
            except Exception as e:
                print(e)
                tk.Label(item_frame, text="Image Load Error", fg="red").pack(side=tk.LEFT, padx=5)

            # Display the text
            tk.Label(item_frame, text=text).pack(side=tk.LEFT, padx=5)
    def finish(self):
        self.driver.close()
        with open(self.csv_file, 'w', newline='') as csv_file:
            writer = csv.writer(csv_file)
            writer.writerow(["url","cluster"])
            for key in self.urlclusters.keys():
                for url in self.urlclusters[key]:
                    print(url,key)
                    writer.writerow([url,key])
        
        self.root.destroy()



def Labeler(urllist,csv_file="data.csv"):
    driver = webdriver.Firefox()
    driver.set_window_size(1920,1080)
    driver.set_window_position(0,0)
    
    root = tk.Tk()
    app = ImageListApp(root,driver,urllist,csv_file)
    root.mainloop()
