const print = @import("std").debug.print;
const expect = @import("std").testing.expect;

pub fn main() void {
    var array = [_]i8{ 31, 41, 59, 26, 41, 58 };

    sort(&array, more_then);

    print("Array: [ ", .{});
    for (array) |value| {
        print("{} ", .{value});
    }
    print("].\n", .{});
}

fn more_then(a: i32, b: i32) bool {
    return a > b;
}

fn less_then(a: i32, b: i32) bool {
    return a < b;
}

const CompareFn = fn (i32, i32) bool;

fn sort(array: []i8, callback: CompareFn) void {
    var i: usize = 1;

    while (i < array.len) {
        const key = array[i];
        var j = i;

        while (j > 0 and callback(array[j - 1], key)) {
            j -= 1;
            array[j + 1] = array[j];
        }
        array[j] = key;
        i += 1;
    }
}
