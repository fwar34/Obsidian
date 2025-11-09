在STM32中获取RTC（实时时钟）时间通常需要以下步骤，适用于大多数STM32系列（如F1、F4、H7等），具体细节可能因型号略有差异：


### **1. 初始化RTC**
首先需要配置RTC外设，包括时钟源选择、 分频系数设置等。常见的时钟源有：
- LSE（外部低速晶振，32.768kHz，推荐，精度高）
- LSI（内部低速时钟，约40kHz，精度较低）
- HSE_RTC（HSE分频后的时钟，较少用）

#### 初始化示例代码（以STM32F1为例）：
```c
#include "stm32f10x.h"

void RTC_Init(void) {
    // 使能PWR和BKP外设时钟
    RCC_APB1PeriphClockCmd(RCC_APB1Periph_PWR | RCC_APB1Periph_BKP, ENABLE);
    
    // 允许访问BKP和RTC
    PWR_BackupAccessCmd(ENABLE);
    
    // 检查RTC是否已初始化（若未初始化则配置）
    if (BKP_ReadBackupRegister(BKP_DR1) != 0x1234) {
        // 复位BKP区域（清除之前的配置）
        BKP_DeInit();
        
        // 配置LSE作为RTC时钟源
        RCC_LSEConfig(RCC_LSE_ON);
        while (RCC_GetFlagStatus(RCC_FLAG_LSERDY) == RESET); // 等待LSE稳定
        RCC_RTCCLKConfig(RCC_RTCCLKSource_LSE);
        
        // 使能RTC时钟
        RCC_RTCCLKCmd(ENABLE);
        
        // 等待RTC寄存器同步
        RTC_WaitForSynchro();
        
        // 配置RTC分频（LSE=32768Hz，分频后1Hz供秒计数）
        RTC_SetPrescaler(32767); // 预分频值 = 32768 - 1
        RTC_WaitForLastTask();   // 等待操作完成
        
        // 标记RTC已初始化（写入备份寄存器，掉电不丢失）
        BKP_WriteBackupRegister(BKP_DR1, 0x1234);
    } else {
        // 若已初始化，仅等待同步
        RTC_WaitForSynchro();
        RTC_WaitForLastTask();
    }
}
```


### **2. 设置RTC时间**
需要将时间（年、月、日、时、分、秒）转换为RTC计数器的`秒数`（从某个基准时间开始，如1970年1月1日），再写入RTC的计数器寄存器。

#### 时间结构体定义：
```c
typedef struct {
    uint16_t year;   // 年份（如2023）
    uint8_t month;   // 月份（1-12）
    uint8_t day;     // 日期（1-31）
    uint8_t hour;    // 小时（0-23）
    uint8_t minute;  // 分钟（0-59）
    uint8_t second;  // 秒（0-59）
} RTC_TimeTypeDef;
```

#### 设置时间示例（需实现`time_to_sec`函数将日期转换为秒）：
```c
// 示例：将时间转换为从2000年1月1日0时0分0秒开始的秒数（需根据实际基准时间调整）
uint32_t time_to_sec(RTC_TimeTypeDef *time) {
    // 实现日期转秒的逻辑（考虑闰年、每月天数等）
    // 此处省略具体实现，可参考标准C库的mktime函数原理
}

void RTC_SetTime(RTC_TimeTypeDef *time) {
    uint32_t sec = time_to_sec(time);
    
    // 进入配置模式
    RTC_EnterConfigMode();
    
    // 设置RTC计数器值
    RTC_SetCounter(sec);
    RTC_WaitForLastTask();
    
    // 退出配置模式
    RTC_ExitConfigMode();
}
```


### **3. 获取RTC时间**
读取RTC计数器的`秒数`，再转换为年月日时分秒格式。

#### 获取时间示例：
```c
// 示例：将秒数转换为日期时间（与time_to_sec基准一致）
void sec_to_time(uint32_t sec, RTC_TimeTypeDef *time) {
    // 实现秒转日期的逻辑（需与time_to_sec对应）
}

void RTC_GetTime(RTC_TimeTypeDef *time) {
    uint32_t sec = RTC_GetCounter(); // 读取当前秒数
    sec_to_time(sec, time);          // 转换为日期时间
}
```


### **4. 注意事项**
1. **备份域电源**：RTC和备份寄存器由VBAT引脚供电（通常接纽扣电池），确保掉电后数据不丢失。
2. **同步问题**：读取RTC计数器前需调用`RTC_WaitForSynchro()`确保寄存器同步。
3. **闰年处理**：`time_to_sec`和`sec_to_time`需正确处理闰年（能被4整除且不能被100整除，或能被400整除）。
4. **时钟源选择**：优先使用LSE（32.768kHz晶振），精度远高于LSI。


### **5. 完整使用流程**
```c
int main(void) {
    RTC_TimeTypeDef current_time;
    
    // 初始化RTC
    RTC_Init();
    
    // 首次使用时设置时间（后续掉电无需重复设置）
    current_time.year = 2023;
    current_time.month = 10;
    current_time.day = 1;
    current_time.hour = 12;
    current_time.minute = 0;
    current_time.second = 0;
    RTC_SetTime(&current_time);
    
    while (1) {
        // 周期性获取时间
        RTC_GetTime(&current_time);
        
        // 处理时间（如打印）
        // ...
        
        delay_ms(1000); // 1秒刷新一次
    }
}
```


### **补充：使用HAL库**
若使用STM32Cube HAL库，流程更简化：
1. 调用`HAL_RTC_Init()`初始化（需在`MX_RTC_Init()`中配置时钟源）。
2. 设置时间：`HAL_RTC_SetTime(&hrtc, &sTime, RTC_FORMAT_BIN)`。
3. 获取时间：`HAL_RTC_GetTime(&hrtc, &sTime, RTC_FORMAT_BIN)`。
4. 获取日期：`HAL_RTC_GetDate(&hrtc, &sDate, RTC_FORMAT_BIN)`。

HAL库会自动处理同步和格式转换，更适合快速开发。

根据具体芯片型号和开发环境（标准库/HAL库），可调整上述代码细节。