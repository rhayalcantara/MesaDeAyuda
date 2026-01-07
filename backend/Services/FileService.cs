namespace MDAyuda.API.Services;

public class FileService : IFileService
{
    private readonly IConfiguration _configuration;
    private readonly ILogger<FileService> _logger;
    private readonly string _uploadPath;
    private readonly long _maxFileSizeBytes;
    private readonly HashSet<string> _allowedExtensions;

    public FileService(IConfiguration configuration, ILogger<FileService> logger, IWebHostEnvironment env)
    {
        _configuration = configuration;
        _logger = logger;

        var fileSettings = configuration.GetSection("FileUpload");
        _uploadPath = Path.Combine(env.ContentRootPath, fileSettings["UploadPath"] ?? "wwwroot/uploads");
        _maxFileSizeBytes = long.Parse(fileSettings["MaxFileSizeBytes"] ?? "10485760"); // 10MB default
        _allowedExtensions = new HashSet<string>(
            (fileSettings["AllowedExtensions"] ?? ".jpg,.jpeg,.png,.gif,.pdf,.doc,.docx,.xls,.xlsx,.txt")
            .Split(',')
            .Select(e => e.Trim().ToLowerInvariant())
        );

        // Ensure upload directory exists
        if (!Directory.Exists(_uploadPath))
        {
            Directory.CreateDirectory(_uploadPath);
        }
    }

    public async Task<(string storedName, string mimeType, long size)> SaveFileAsync(IFormFile file)
    {
        if (file == null || file.Length == 0)
        {
            throw new ArgumentException("No file provided");
        }

        if (!IsFileSizeAllowed(file.Length))
        {
            throw new ArgumentException($"File size exceeds maximum allowed size of {_maxFileSizeBytes / 1024 / 1024}MB");
        }

        var extension = Path.GetExtension(file.FileName).ToLowerInvariant();
        if (!IsAllowedFileType(file.FileName, file.ContentType))
        {
            throw new ArgumentException($"File type {extension} is not allowed");
        }

        var storedName = $"{Guid.NewGuid()}{extension}";
        var filePath = Path.Combine(_uploadPath, storedName);

        try
        {
            await using var stream = new FileStream(filePath, FileMode.Create);
            await file.CopyToAsync(stream);

            _logger.LogInformation("File saved: {StoredName} ({Size} bytes)", storedName, file.Length);

            return (storedName, file.ContentType, file.Length);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to save file: {FileName}", file.FileName);
            throw;
        }
    }

    public async Task<(byte[] content, string mimeType, string fileName)> GetFileAsync(string storedName)
    {
        var filePath = Path.Combine(_uploadPath, storedName);

        if (!File.Exists(filePath))
        {
            throw new FileNotFoundException("File not found", storedName);
        }

        var content = await File.ReadAllBytesAsync(filePath);
        var mimeType = GetMimeType(Path.GetExtension(storedName));

        return (content, mimeType, storedName);
    }

    public Task DeleteFileAsync(string storedName)
    {
        var filePath = Path.Combine(_uploadPath, storedName);

        if (File.Exists(filePath))
        {
            File.Delete(filePath);
            _logger.LogInformation("File deleted: {StoredName}", storedName);
        }

        return Task.CompletedTask;
    }

    public bool IsAllowedFileType(string fileName, string mimeType)
    {
        var extension = Path.GetExtension(fileName).ToLowerInvariant();
        return _allowedExtensions.Contains(extension);
    }

    public bool IsFileSizeAllowed(long size)
    {
        return size <= _maxFileSizeBytes;
    }

    private static string GetMimeType(string extension)
    {
        return extension.ToLowerInvariant() switch
        {
            ".jpg" or ".jpeg" => "image/jpeg",
            ".png" => "image/png",
            ".gif" => "image/gif",
            ".pdf" => "application/pdf",
            ".doc" => "application/msword",
            ".docx" => "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
            ".xls" => "application/vnd.ms-excel",
            ".xlsx" => "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
            ".txt" => "text/plain",
            _ => "application/octet-stream"
        };
    }
}
