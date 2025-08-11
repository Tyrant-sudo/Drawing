import os
import time
import shutil
from pathlib import Path

# 配置路径
DOWNLOAD_FOLDER = Path.home() / "Downloads"  # 默认下载文件夹
PROJECT_FOLDER = Path(__file__).parent.absolute()  # 当前脚本所在文件夹
IMAGES_FOLDER = PROJECT_FOLDER / "fireworks_images"  # 目标文件夹

def create_images_folder():
    """创建用于存放图片的文件夹"""
    if not IMAGES_FOLDER.exists():
        IMAGES_FOLDER.mkdir()
        print(f"创建文件夹: {IMAGES_FOLDER}")

def move_fireworks_images():
    """移动烟花图片到指定文件夹"""
    # 确保目标文件夹存在
    create_images_folder()
    
    # 查找下载文件夹中的烟花图片
    fireworks_files = list(DOWNLOAD_FOLDER.glob("fireworks*.png"))
    
    if not fireworks_files:
        print("未找到烟花图片文件")
        return
    
    # 移动文件
    moved_count = 0
    for file_path in fireworks_files:
        try:
            # 构造目标路径
            destination = IMAGES_FOLDER / file_path.name
            
            # 如果文件已存在，先删除
            if destination.exists():
                destination.unlink()
            
            # 移动文件
            shutil.move(str(file_path), str(destination))
            print(f"已移动: {file_path.name}")
            moved_count += 1
        except Exception as e:
            print(f"移动文件 {file_path.name} 时出错: {e}")
    
    print(f"总共移动了 {moved_count} 个文件到 {IMAGES_FOLDER}")

def watch_and_move():
    """监控下载文件夹并自动移动图片"""
    print(f"开始监控下载文件夹: {DOWNLOAD_FOLDER}")
    print(f"图片将被移动到: {IMAGES_FOLDER}")
    print("按 Ctrl+C 停止监控")
    
    # 记录初始文件数量
    initial_count = len(list(DOWNLOAD_FOLDER.glob("fireworks*.png")))
    
    try:
        while True:
            current_count = len(list(DOWNLOAD_FOLDER.glob("fireworks*.png")))
            
            # 如果文件数量增加，移动新文件
            if current_count > initial_count:
                move_fireworks_images()
                initial_count = current_count
            
            time.sleep(2)  # 每2秒检查一次
    except KeyboardInterrupt:
        print("\n监控已停止")

if __name__ == "__main__":
    # 创建参数选择
    print("选择操作模式:")
    print("1. 一次性移动现有图片")
    print("2. 持续监控并自动移动图片")
    
    choice = input("请输入选项 (1 或 2): ").strip()
    
    if choice == "1":
        move_fireworks_images()
    elif choice == "2":
        watch_and_move()
    else:
        print("无效选项")