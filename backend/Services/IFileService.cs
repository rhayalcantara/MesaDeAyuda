namespace MDAyuda.API.Services;

public interface IFileService
{
    Task<(string storedName, string mimeType, long size)> SaveFileAsync(IFormFile file);
    Task<(byte[] content, string mimeType, string fileName)> GetFileAsync(string storedName);
    Task DeleteFileAsync(string storedName);
    bool IsAllowedFileType(string fileName, string mimeType);
    bool IsFileSizeAllowed(long size);
}
