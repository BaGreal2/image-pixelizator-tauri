#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

use base64::{engine::general_purpose, Engine as _};
use image::{
    load_from_memory_with_format, DynamicImage, GenericImageView, ImageBuffer, ImageFormat,
    ImageOutputFormat, Rgba,
};
use regex::Regex;
use std::io::Cursor;

type Image = ImageBuffer<Rgba<u8>, Vec<u8>>;

fn get_format_enum(format_str: &String) -> ImageFormat {
    match format_str.as_str() {
        "png" => ImageFormat::Png,
        "jpg" | "jpeg" => ImageFormat::Jpeg,
        "webp" => ImageFormat::WebP,
        _ => ImageFormat::Png,
    }
}

fn get_output_format_enum(format_str: &String) -> ImageOutputFormat {
    match format_str.as_str() {
        "png" => ImageOutputFormat::Png,
        "jpg" | "jpeg" => ImageOutputFormat::Jpeg(60),
        _ => ImageOutputFormat::Unsupported("Not supported file type!".to_string()),
    }
}

fn remove_base64_header(base64_str: &String) -> String {
    let re = Regex::new(r"data:image/[^;]+;base64,").unwrap();
    re.replace_all(&base64_str, "").to_string()
}

fn image_to_base64(img: &DynamicImage, format: &String) -> String {
    let mut image_data: Vec<u8> = Vec::new();
    let current_format = get_output_format_enum(format);
    img.write_to(&mut Cursor::new(&mut image_data), current_format)
        .unwrap();
    let res_base64 = general_purpose::STANDARD.encode(image_data);
    format!("data:image/{};base64,{}", format, res_base64)
}

fn base64_to_image(base64_str: &String, format: &String) -> DynamicImage {
    let trimmed_base64 = remove_base64_header(&base64_str);
    let decoded_bytes = general_purpose::STANDARD.decode(trimmed_base64).unwrap();
    let current_format = get_format_enum(format);
    load_from_memory_with_format(&decoded_bytes, current_format).unwrap()
}

fn resize(img: &Image, new_dims: (u32, u32)) -> Image {
    let (old_width, old_height) = img.dimensions();
    let (new_width, new_height) = new_dims;

    let mut resized = ImageBuffer::new(new_width, new_height);

    for (new_x, new_y, pixel) in resized.enumerate_pixels_mut() {
        let old_x = (new_x as f32 * (old_width as f32 / new_width as f32)) as u32;
        let old_y = (new_y as f32 * (old_height as f32 / new_height as f32)) as u32;

        if let Some(old_pixel) = img.get_pixel_checked(old_x, old_y) {
            *pixel = *old_pixel;
        } else {
            println!("({old_x} -> {new_x}, {old_y} -> {new_y})");
        }
    }

    resized
}

fn reverse_colors(img: &Image) -> Image {
    let (w, h) = img.dimensions();
    let mut reversed: Image = ImageBuffer::new(w, h);
    for (x, y, pixel) in reversed.enumerate_pixels_mut() {
        let old_pixel = img.get_pixel(x, y);
        let red = old_pixel.0[0];
        let blue = old_pixel.0[1];
        let green = old_pixel.0[2];
        *pixel = Rgba([255 - red, 255 - blue, 255 - green, old_pixel.0[3]]);
    }

    reversed
}

fn calculate_avg_for_color(img_arr: &mut Vec<([u8; 4], (u32, u32))>, color: usize) -> u8 {
    let mut sum: u32 = 0;
    for i in 0..img_arr.len() {
        sum += img_arr[i].0[color] as u32;
    }

    (sum / img_arr.len() as u32) as u8
}

fn median_cut_quantize(img: &mut Image, img_arr: &mut Vec<([u8; 4], (u32, u32))>) {
    let r_avg = calculate_avg_for_color(img_arr, 0);
    let g_avg = calculate_avg_for_color(img_arr, 1);
    let b_avg = calculate_avg_for_color(img_arr, 2);

    for data in img_arr {
        img.put_pixel(data.1 .0, data.1 .1, Rgba([r_avg, g_avg, b_avg, 255]));
    }
}

fn split_into_buckets(img: &mut Image, img_arr: &mut Vec<([u8; 4], (u32, u32))>, depth: u8) {
    if img_arr.len() == 0 {
        return;
    }
    if depth == 0 {
        median_cut_quantize(img, img_arr);
        return;
    }
    let max_r = img_arr.iter().max_by_key(|x| x.0[0]).unwrap();
    let max_g = img_arr.iter().max_by_key(|x| x.0[1]).unwrap();
    let max_b = img_arr.iter().max_by_key(|x| x.0[2]).unwrap();
    let min_r = img_arr.iter().min_by_key(|x| x.0[0]).unwrap();
    let min_g = img_arr.iter().min_by_key(|x| x.0[1]).unwrap();
    let min_b = img_arr.iter().min_by_key(|x| x.0[2]).unwrap();

    let r_range = max_r.0[0] - min_r.0[0];
    let g_range = max_g.0[1] - min_g.0[1];
    let b_range = max_b.0[2] - min_b.0[2];

    let mut space_with_highest_range: usize = 0;

    if g_range >= r_range && g_range >= b_range {
        space_with_highest_range = 1;
    } else if b_range >= r_range && b_range >= g_range {
        space_with_highest_range = 2;
    }

    img_arr.sort_by(|a, b| a.0[space_with_highest_range].cmp(&b.0[space_with_highest_range]));
    let median_index = ((img_arr.len() + 1) / 2) as usize;

    split_into_buckets(img, &mut img_arr[0..median_index].to_vec(), depth - 1);
    split_into_buckets(img, &mut img_arr[median_index..].to_vec(), depth - 1);
}

fn reduce_colors(img: &Image, colors_amount: u8) -> Image {
    let (w, h) = img.dimensions();
    let mut reduced: Image = ImageBuffer::new(w, h);
    let mut img_arr: Vec<([u8; 4], (u32, u32))> = Vec::new();
    for (x, y, pixel) in img.enumerate_pixels() {
        img_arr.push(([pixel.0[0], pixel.0[1], pixel.0[2], pixel.0[3]], (x, y)));
    }
    split_into_buckets(&mut reduced, &mut img_arr, colors_amount);

    reduced
}

#[tauri::command(async)]
fn pixelizate(
    base64_str: String,
    new_dims: (u32, u32),
    format: String,
    filters: (bool, (bool, u8), bool),
) -> String {
    let mut img = base64_to_image(&base64_str, &format);
    if filters.2 {
        img = img.grayscale();
    }
    let old_dims = img.dimensions();
    let img_rgba = img.to_rgba8();

    let mut small = resize(
        &img_rgba,
        ((old_dims.0 / new_dims.0), (old_dims.1 / new_dims.1)),
    );

    if filters.0 {
        small = reverse_colors(&small);
    }
    if filters.1 .0 {
        small = reduce_colors(&small, filters.1 .1);
    }

    let pixelated = resize(&small, old_dims);

    return image_to_base64(&DynamicImage::ImageRgba8(pixelated), &format);
}

fn main() {
    tauri::Builder::default()
        .invoke_handler(tauri::generate_handler![pixelizate])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
