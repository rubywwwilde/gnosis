const std = @import("std");
const print = std.debug.print;

pub fn main() !void {
    var array = [_]i32{ 5, 1 };

    try sort(&array, less_then);

    print("Array: [ ", .{});
    for (array) |value| {
        print("{} ", .{value});
    }
    print("].\n", .{});
}

pub fn less_then(a: ?i32, b: ?i32) bool {
    if (a == null and b == null) return false;
    if (a == null) return false;
    if (b == null) return true;
    return a.? < b.?;
}

const PickFn = fn (?i32, ?i32) bool;

fn printArray(array: []const i32) void {
    print("[ ", .{});
    for (array) |value| {
        print("{} ", .{value});
    }
    print("]", .{});
}

// Can I mutate an array using a slice?
pub fn sort(array: []i32, callback: PickFn) !void {
    if (array.len < 2) return;

    print("Splitting array with {} elements: ", .{array.len});
    printArray(array);
    print(".\n", .{});

    const left_edge = array.len / 2;
    const right_edge = array.len / 2;
    print("Left edge: {}. Right edge: {}\n", .{ left_edge, right_edge });

    const left_array = array[0..left_edge];
    const right_array = array[right_edge..array.len];

    print("L Array: ", .{});
    printArray(left_array);
    print(".\n", .{});

    print("R Array: ", .{});
    printArray(right_array);
    print(".\n", .{});

    try sort(left_array, callback);
    try sort(right_array, callback);

    try merge(left_array, right_array, array, callback);
}
fn merge(left_slice: []const i32, right_slice: []const i32, writeTo: []i32, pick: PickFn) !void {
    // do memory allocation here to copy the slice to a new array™
    // is it okay to create allocator inside of a function, or do I need to pass it to the function?
    print("left slice len: {}", .{left_slice.len});
    var gpa = std.heap.GeneralPurposeAllocator(.{}){};
    const allocator = gpa.allocator();
    // should I rather use arena allocator here? what are the benefits?
    const left = try allocator.alloc(i32, left_slice.len);
    const right = try allocator.alloc(i32, right_slice.len);
    defer allocator.free(left);
    defer allocator.free(right);

    @memcpy(left, left_slice);
    @memcpy(right, right_slice);

    print("Merging left: ", .{});
    printArray(left);
    print(" and right: ", .{});
    printArray(right);
    print(".\n", .{});

    var left_i: usize = 0;
    var right_i: usize = 0;

    while (left_i < left.len or right_i < right.len) {
        const left_val = get_or_null(left, left_i);
        const right_val = get_or_null(right, right_i);

        print("Comparing ", .{});
        if (left_val) |val| {
            print("{}", .{val});
        } else {
            print("null", .{});
        }
        print(" and ", .{});
        if (right_val) |val| {
            print("{}", .{val});
        } else {
            print("null", .{});
        }
        print("\n", .{});

        if (pick(left_val, right_val)) {
            print("Picking left {} at index {}\n", .{ left[left_i], left_i });
            writeTo[left_i + right_i] = left[left_i];
            left_i += 1;
        } else {
            print("Picking right {} at index {}\n", .{ right[right_i], right_i });
            writeTo[left_i + right_i] = right[right_i];
            right_i += 1;
        }
    }

    print("Merged result: ", .{});
    printArray(writeTo);
    print(".\n", .{});
}

fn get_or_null(array: []const i32, index: usize) ?i32 {
    if (index >= array.len) return null;
    return array[index];
}
