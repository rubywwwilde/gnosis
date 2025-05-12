const print = @import("std").debug.print;

pub fn main() void {
    var array = [_]i32{ 31, 41, 59, 26, 41, 58 };

    sort(&array, less_then);

    print("Array: [ ", .{});
    for (array) |value| {
        print("{} ", .{value});
    }
    print("].\n", .{});
}

fn less_then(a: ?i32, b: ?i32) bool {
    if (a == null and b == null) return false;
    if (a == null) return false;
    if (b == null) return true;
    return a.? < b.?;
}

const PickFn = fn (?i32, ?i32) bool;

fn sort(array: []i32, callback: PickFn) void {
    // do split. I can slice the original array, but how do I keep all the indexes?
    // do I make a separate array to keep track of arrays? that seems complex
    // do I just merge elements one by one? how? that seems not smart
    //
    // If I do make a separate array of slices, then it's lenghts should be lenghts of initial array
    //
    // Do I use recursion here? So inside of sort I do split and merge?
    if (array.len == 1) return;

    const left_edge = array.len / 2;
    const right_edge = array.len / 2 + 1;

    const left_array = array[0..left_edge];
    const right_array = array[right_edge..array.len];

    sort(left_array, callback);
    sort(right_array, callback);

    merge(left_array, right_array, array, callback);
}

fn merge(left: []const i32, right: []const i32, writeTo: [*]i32, pick: PickFn) void {
    var left_i: usize = 0;
    var right_i: usize = 0;

    while (left_i < left.len or right_i < right.len) {
        const left_val = get_or_null(left, left_i);
        const right_val = get_or_null(right, right_i);

        if (pick(left_val, right_val)) {
            writeTo[left_i + right_i] = left[left_i];
            left_i += 1;
        } else {
            writeTo[left_i + right_i] = right[right_i];
            right_i += 1;
        }
    }
}

fn get_or_null(array: []const i32, index: usize) ?i32 {
    if (index >= array.len) return null;
    return array[index];
}
