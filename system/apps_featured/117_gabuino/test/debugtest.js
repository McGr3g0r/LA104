var Debugger = require("../web/v1/debugger.js");

var dbg = new Debugger();
dbg.setCode(getCode());
dbg.initializeDebugger()
.then( () =>
  {
    var stack = ['0x00000000', '0x08041b77 (ds213_gabuino) st_usbfs_poll', '0x08041b03 (ds213_gabuino) st_usbfs_poll', '0x42228198', '0x60000000', '0xfffffff9', '0x00000123', '0x00000000', '0x0000018f', '0x000000ef', '0x0800028d', '0x08008649 (ds213_os_bb9698a0) BIOS::LCD::PutPixel(int, int, unsigned short)', '0x080002ae', '0x69000000', '0x0000462c', '0x00000079', '0x00000000', '0x00000123', '0x2000525b', '0x000000c8', '0x00007900', '0x00012301', '0x200084b8', '0x20008498', '0x592e8480', '0x00007900', '0x20004780 (ds213_gabuino) MEMORY::userRetVal', '0x20008490', '0x2000552f', '0x00007b00', '0x00013100', '0x00006d00', '0x0000c800', '0x00000e00', '0x00006900', '0x200084ac', '0x20001524 (ds213_os_bb9698a0) Hw', '0x200084b4', '0x00000000', '0x200084c7', '0x200084c4', '0x20008500', '0x0073cdbd', '0x00007b00', '0x00013100', '0x00006d00', '0x0000c800', '0x00000080', '0x00007b00', '0x00013100', '0x00000022', '0x00012301', '0x00007938', '0x00000000', '0x00007b00', '0x20008508', '0x2000509b', '0x00003ecc', '0x00000000', '0x00000061', '0x00003ecc', '0x0000007b', '0x00000131', '0x00000001', '0x00000000', '0x0000006d', '0x000000c8', '0xfdffbd7c', '0x20004834 (ds213_gabuino) MEMORY::writeSum', '0x20008538', '0x200050f9', '0x20008540', '0x20005105', '0x20008548', '0x20005111', '0x20008550', '0x2000511d', '0x20008558', '0x20005009', '0x00007fe5', '0x08040751 (ds213_gabuino) MEMORY::Exec(unsigned long)', '0x08040725 (ds213_gabuino) MEMORY::Exec(unsigned long)', '0x00000000', '0x20004b1d', '0x08040bb1', '0x08041b03 (ds213_gabuino) st_usbfs_poll', '0x20004834 (ds213_gabuino) MEMORY::writeSum', '0x200049e0 (ds213_gabuino) command', '0x200049e0 (ds213_gabuino) command', '0x00000000'];
    stack = stack.map(f=>parseInt(f.substr(0,10)));
    console.log(stack.map(p => dbg.decodeAddr(p)).filter(x => x).join("\n"))
  })
.then( () =>
  {
    console.log(dbg.getVariables());
  });

function getCode()
{
  return `#pragma GCC optimize ("-O0")
#include <library.h>

int mojaPremenna = 32;
char mojString[32] = "test";
struct pt {
int x;
int y;
} mojPoint{7, 8};

using namespace BIOS;

typedef int fix16_t;
void drawline_aa(fix16_t fx1, fix16_t fy1, fix16_t fx2, fix16_t fy2, int color);

void main5(void)
{
    int x = 100, y = 100, c = 0;
    KEY::EKey key;
    while ((key = KEY::GetKey()) != KEY::EKey::Escape)
    {
        int x1 = rand() % LCD::Width;
        int y1 = 16+(rand() % (LCD::Height-32));
        int c = rand() & 0xffff;
        drawline_aa(x*256, y*256, x1*256, y1*256, c);
        x = x1;
        y = y1;

        if ((c++ % 1000) == 0)
            DBG::Print("<b>%d</b> lines, ", c);
    }
}

void main4(void) { main5(); }
void main3(void) { main4(); }
void main2(void) { main3(); }
void main1(void) { main2(); }

int main(void)
{
    main1();
    return 0;
}


// https://github.com/PetteriAimonen/QuadPawn/blob/master/Runtime/drawing.c

/* Antialiased line drawing */

// Alpha-blend two colors together. Alpha is 0 to 255.
// The ratios have been biased a bit to make the result look
// better on a cheap TFT.
int blend(int fg, int bg, int alpha)
{
    int fg_per_2 = (fg & 0xF7DE) >> 1;
    int fg_per_4 = (fg & 0xE79C) >> 2;
    int fg_per_8 = (fg & 0xC718) >> 3;
    
    int bg_per_2 = (bg & 0xF7DE) >> 1;
    int bg_per_4 = (bg & 0xE79C) >> 2;
    int bg_per_8 = (bg & 0xC718) >> 3;
    
    if (alpha > 224)
        return fg; // 100% blend
    else if (alpha > 192)
        return (fg - fg_per_8 + bg_per_8); // 88% blend
    else if (alpha > 128)
        return (fg - fg_per_4 + bg_per_4); // 75% blend
    else if (alpha > 64)
        return (fg_per_2 + bg_per_2); // 50% blend
    else if (alpha > 32)
        return (fg_per_4 + bg - bg_per_4); // 25% blend
    else
        return bg; // 0% blend
}


// Draws antialiased lines
// Xiaolin Wu's algorithm, using x/256 fixed point values
void drawline_aa(fix16_t x1, fix16_t y1, fix16_t x2, fix16_t y2, int color)
{
    bool reverse_xy = false;
    
    auto swap = [](int *x, int *y) {
        int temp = *x;
        *x = *y;
        *y = temp;
    };
    
    // plot the pixel at (x, y) with brightness c
    auto plot = [&](int x, int y, int c) {
        if (reverse_xy)
            swap(&x, &y);
        
        uint16_t oldcolor = BIOS::LCD::GetPixel(x >> 8, y >> 8);
        BIOS::LCD::PutPixel(x >> 8, y >> 8, blend(color, oldcolor, c));
    };
    
    // Integer part of x
    auto ipart = [](int x) -> int {
        return x & (~0xFF);
    };
    
    auto round = [&](int x) -> int {
        return ipart(x + 128);
    };
    
    // Fractional part of x
    auto fpart = [](int x) -> int {
        return x & 0xFF;
    };
    
    // Remaining fractional part of x
    auto rfpart = [&](int x) -> int {
        return 256 - fpart(x);
    };

    int dx = x2 - x1;
    int dy = y2 - y1;
    if (abs(dx) < abs(dy))
    {
        swap(&x1, &y1);
        swap(&x2, &y2);
        swap(&dx, &dy);
        reverse_xy = true;
    }
    
    if (x2 < x1)
    {
        swap(&x1, &x2);
        swap(&y1, &y2);
    }
    
    int gradient = dy * 256 / dx;
    
    // handle first endpoint
    int xend = round(x1);
    int yend = y1 + gradient * (xend - x1) / 256;
    int xgap = rfpart(x1 + 128);
    int xpxl1 = xend;  // this will be used in the main loop
    int ypxl1 = ipart(yend);
    plot(xpxl1, ypxl1, rfpart(yend) * xgap / 256);
    plot(xpxl1, ypxl1 + 256, fpart(yend) * xgap / 256);
    int intery = yend + gradient; // first y-intersection for the main loop
    
    // handle second endpoint
    xend = round(x2);
    yend = y2 + gradient * (xend - x2) / 256;
    xgap = fpart(x2 + 128);
    int xpxl2 = xend;  // this will be used in the main loop
    int ypxl2 = ipart(yend);
    plot(xpxl2, ypxl2, rfpart(yend) * xgap / 256);
    plot(xpxl2, ypxl2 + 256, fpart(yend) * xgap / 256);
    
    // main loop
    for (int x = xpxl1 + 1; x <= xpxl2 - 1; x += 256)
    {
        plot(x, ipart(intery), rfpart(intery));
        plot(x, ipart(intery) + 256, fpart(intery));
        intery = intery + gradient;
    }
}

/* Non-antialiased line drawing */

void drawline(int x1, int y1, int x2, int y2, int color, int dots)
{
    // Algorithm from here: http://en.wikipedia.org/wiki/Bresenham%27s_line_algorithm#Simplification
    int dx = abs(x2 - x1);
    int dy = abs(y2 - y1);
    
    int sx = (x1 < x2) ? 1 : -1;
    int sy = (y1 < y2) ? 1 : -1;
    
    int err = dx - dy;
    int count = 0;
    for(;; count++)
    {
        if (!dots || (count >> (dots - 1)) & 1)
        {
            //__Point_SCR(x1, y1);
            //__LCD_SetPixl(color);
        }
        
        if (x1 == x2 && y1 == y2) break;
        
        int e2 = 2 * err;
        if (e2 > -dy)
        {
            err -= dy;
            x1 += sx;
        }
        else if (e2 < dx)
        {
            err += dx;
            y1 += sy;
        }
    }
}
`;
}